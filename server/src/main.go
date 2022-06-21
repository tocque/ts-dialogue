package main

import (
	"bytes"
	"crypto/md5"
	_ "embed"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math/rand"
	"mime"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/gin-gonic/gin"
)

const configName = "server-config.json"

type Config struct {
	Port int64
}

func initConfig() Config {
	config := Config{}

	if isFile(configName) {
		file, err := os.Open(configName)
		if err == nil {
			decoder := json.NewDecoder(file)
			decoder.Decode(&config)
			return config
		}
		file.Close()
	}

	fmt.Printf("缺少配置文件，尝试生成%s\n", configName)

	// [2000, 10000) 中随机挑选
	rand.Seed(time.Now().UnixNano())
	config.Port = rand.Int63n(8000) + 2000

	data, err := json.MarshalIndent(config, "", "    ")

	if err != nil {
		return config
	}
	err = os.WriteFile(configName, data, os.ModeAppend|0744)
	if err != nil {
		fmt.Printf("写入失败: %o\n", err)
	}

	return config
}

var config = initConfig()

func codeLog(opt string, cost time.Duration, filepath string) {
	fmt.Printf("[code] %-15s | %10v | \"%s\"\n", opt, cost, filepath)
}

func getLoader(filepath string) api.Loader {
	extname := path.Ext(filepath)
	switch extname {
	case ".js":
		return api.LoaderJS
	case ".ts":
		return api.LoaderTS
	case ".jsx":
		return api.LoaderJSX
	case ".tsx":
		return api.LoaderTSX
	default:
		return api.LoaderNone
	}
}

func isModule(filepath string) bool {
	extname := path.Ext(filepath)
	switch extname {
	case ".mjs":
		fallthrough
	case ".mts":
		return true
	}
	return false
}

type CacheItem struct {
	sign    [16]byte
	content string
}

//go:embed error.js
var errorModal string

var codeFileCache = sync.Map{}

func handleCodeFile(filePath string) (string, error) {
	filePath = path.Clean(filePath)
	startTime := time.Now()
	bytes, err := os.ReadFile(filePath)
	if err != nil {
		codeLog("file/missing", time.Since(startTime), filePath)
		return "", err
	}
	// 如果文件以 .min.js 结尾，直接忽略
	if strings.HasSuffix(filePath, ".min.js") {
		codeLog("file/skipped", time.Since(startTime), filePath)
		return string(bytes), nil
	}
	// 尝试读取 cache
	cacheItem, exist := codeFileCache.Load(filePath)
	sign := md5.Sum(bytes)
	if exist && sign == cacheItem.(CacheItem).sign {
		codeLog("file/cached", time.Since(startTime), filePath)
		return cacheItem.(CacheItem).content, nil
	}
	content := string(bytes)
	loader := getLoader(filePath)
	result := api.Transform(content, api.TransformOptions{
		Format:            api.FormatDefault,
		Loader:            loader,
		Sourcefile:        filePath,
		Target:            api.ES2015,
		MinifySyntax:      false,
		MinifyWhitespace:  false,
		MinifyIdentifiers: false,
		TreeShaking:       api.TreeShakingFalse,
		JSXMode:           api.JSXModeTransform,
		JSXFactory:        "h",
		JSXFragment:       "Fragment",
		Sourcemap:         api.SourceMapInline,
	})
	codeLog("file/transform", time.Since(startTime), filePath)
	if len(result.Errors) > 0 {
		errorsJson, _ := json.Marshal(result.Errors)
		return fmt.Sprintf("%s(%s)", errorModal, string(errorsJson)), nil
	}
	res := string(result.Code)
	codeFileCache.Store(filePath, CacheItem{
		sign:    sign,
		content: res,
	})
	return res, nil
}

var codeModuleCache = sync.Map{}

func handleCodeModule(entry string) (string, error) {
	startTime := time.Now()
	// 尝试读取 cache
	cacheItem, exist := codeModuleCache.Load(entry)
	var result api.BuildResult
	if exist {
		result = cacheItem.(api.BuildResult).Rebuild()
		codeLog("module/rebundle", time.Since(startTime), entry)
	} else {
		result = api.Build(api.BuildOptions{
			Bundle:            true,
			Write:             false,
			EntryPoints:       []string{entry},
			Target:            api.ES2015,
			MinifySyntax:      false,
			MinifyWhitespace:  false,
			MinifyIdentifiers: false,
			Sourcemap:         api.SourceMapInline,
			Incremental:       true,
		})
		codeLog("module/bundle", time.Since(startTime), entry)
	}

	if len(result.Errors) > 0 {
		errorsJson, _ := json.Marshal(result.Errors)
		return fmt.Sprintf("%s(%s)", errorModal, string(errorsJson)), nil
	}
	codeModuleCache.Store(entry, result)
	return string(result.OutputFiles[0].Contents), nil
}

func checkPath(path string) bool {
	if path == "" {
		return false
	}
	res := filepath.Clean(path)
	if strings.HasPrefix(res, "..") {
		return false
	}
	if strings.HasPrefix(res, "/") {
		return false
	}
	return true
}

func isFile(filepath string) bool {
	info, err := os.Stat(filepath)
	if err != nil {
		return false
	}
	if info.IsDir() {
		return false
	}
	return true
}

func isDir(filepath string) bool {
	info, err := os.Stat(filepath)
	if err != nil {
		return false
	}
	if !info.IsDir() {
		return false
	}
	return true
}

func isPortUsed(port int64) bool {
	addr := fmt.Sprintf("0.0.0.0:%d", port)
	listener, err := net.Listen("tcp", addr)

	if err != nil {
		return true
	}

	listener.Close()
	return false
}

func open(url string) error {
	var cmd string
	var args []string

	switch runtime.GOOS {
	case "windows":
		cmd = "cmd"
		args = []string{"/c", "start"}
	case "darwin":
		cmd = "open"
	default: // "linux", "freebsd", "openbsd", "netbsd"
		cmd = "xdg-open"
	}
	args = append(args, url)
	return exec.Command(cmd, args...).Start()
}

func brokenParamsHandler(c *gin.Context) {
	ct := c.Request.Header.Get("Content-Type")
	ct, _, _ = mime.ParseMediaType(ct)
	if ct == "text/plain" {
		c.Request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		var bodyBytes []byte
		if c.Request.Body != nil {
			bodyBytes, _ = ioutil.ReadAll(c.Request.Body)
		}
		rawParam := string(bodyBytes)
		rawParamSpans := strings.Split(rawParam, "&")
		transformedSpans := make([]string, 0)
		for _, span := range rawParamSpans {

			kv := strings.SplitN(span, "=", 2)

			transformedSpans = append(transformedSpans, kv[0]+"="+url.QueryEscape(kv[1]))
		}
		transformed := strings.Join(transformedSpans, "&")
		c.Request.Body = ioutil.NopCloser(bytes.NewBuffer([]byte(transformed)))
	}
	c.Next()
}

func main() {

	r := gin.New()
	r.SetTrustedProxies(nil)

	r.Use(gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		var statusColor, methodColor, resetColor string
		if param.IsOutputColor() {
			statusColor = param.StatusCodeColor()
			methodColor = param.MethodColor()
			resetColor = param.ResetColor()
		}

		if param.Latency > time.Minute {
			// Truncate in a golang < 1.8 safe way
			param.Latency = param.Latency - param.Latency%time.Second
		}
		return fmt.Sprintf("[GIN] %v |%s %3d %s| %13v |%s %-7s %s %#v\n%s",
			param.TimeStamp.Format("15:04:05"),
			statusColor, param.StatusCode, resetColor,
			param.Latency,
			methodColor, param.Method, resetColor,
			param.Path,
			param.ErrorMessage,
		)
	}))
	r.Use(gin.Recovery())

	r.GET("/*filepath", func(c *gin.Context) {
		filepath := "." + c.Param("filepath")

		// 不缓存文件
		c.Header("Cache-Control", "no-cache")
		c.Header("Pragma", "no-cache")
		c.Header("Expires", "0")

		if getLoader(filepath) != api.LoaderNone {
			content, err := handleCodeFile(filepath)
			if err != nil {
				c.Status(404)
				return
			}
			c.Header("Content-Type", "text/javascript; charset=utf-8")

			c.String(http.StatusOK, content)
		} else if isModule(filepath) {
			content, err := handleCodeModule(filepath)
			if err != nil {
				c.Status(404)
				return
			}
			c.Header("Content-Type", "text/javascript; charset=utf-8")

			c.String(http.StatusOK, content)
		} else {
			c.File(filepath)
			ext := path.Ext(filepath)
			if ext == ".css" {
				c.Header("Content-Type", "text/css; charset=utf-8")
			}
		}
	})

	g := r.Group(".", brokenParamsHandler)

	g.POST("/readFile", func(c *gin.Context) {
		tp := c.DefaultPostForm("type", "base64")
		filePath := c.DefaultPostForm("name", "")

		if !checkPath(filePath) {
			c.Status(403)
			return
		}

		if !isFile(filePath) {
			c.Status(404)
			return
		}

		bytes, err := os.ReadFile(filePath)

		if err != nil {
			c.Status(500)
			return
		}

		content := ""

		if tp == "utf-8" {
			content = string(bytes)
		} else {
			content = base64.StdEncoding.EncodeToString(bytes)
		}
		c.String(http.StatusOK, content)
	})

	g.POST("/writeFile", func(c *gin.Context) {
		tp := c.DefaultPostForm("type", "base64")
		filePath := c.DefaultPostForm("name", "")
		rawdata := c.DefaultPostForm("value", "")

		if !checkPath(filePath) {
			c.Status(403)
			return
		}

		var data []byte
		if tp == "base64" {
			k, err := base64.StdEncoding.DecodeString(rawdata)
			if err != nil {
				c.Status(500)
				return
			}
			data = k
		} else {
			data = []byte(rawdata)
		}

		err := os.WriteFile(filePath, data, os.ModeAppend|0744)

		if err != nil {
			c.Status(500)
			return
		}
		c.String(http.StatusOK, strconv.FormatInt(int64(len(data)), 10))
	})

	g.POST("/writeMultiFiles", func(c *gin.Context) {
		tp := c.DefaultPostForm("type", "base64")
		filePathset := c.DefaultPostForm("name", "")
		rawdataset := c.DefaultPostForm("value", "")

		filePaths := strings.Split(filePathset, ";")
		rawdatas := strings.Split(rawdataset, ";")

		l := 0

		for i, filePath := range filePaths {

			if !checkPath(filePath) {
				c.Status(403)
				return
			}

			rawdata := rawdatas[i]

			var data []byte
			if tp == "base64" {
				k, err := base64.StdEncoding.DecodeString(rawdata)
				if err != nil {
					c.Status(500)
					return
				}
				data = k
			} else {
				data = []byte(rawdata)
			}

			err := os.WriteFile(filePath, data, os.ModeAppend|0744)

			if err != nil {
				println(err.Error())
				c.Status(500)
				return
			}

			l += len(data)
		}
		c.String(http.StatusOK, strconv.FormatInt(int64(l), 10))
	})

	g.POST("/listFile", func(c *gin.Context) {
		filePath := c.DefaultPostForm("name", "")

		if !checkPath(filePath) {
			c.Status(403)
			return
		}

		if !isDir(filePath) {
			c.Status(404)
			return
		}

		entries, err := os.ReadDir(filePath)
		if err != nil {
			c.Status(500)
			return
		}

		list := make([]string, 0)

		for _, entry := range entries {
			if !entry.IsDir() {
				name := entry.Name()
				list = append(list, name)
			}
		}

		c.JSON(http.StatusOK, list)
	})

	g.POST("/makeDir", func(c *gin.Context) {
		filePath := c.DefaultPostForm("name", "")

		if !checkPath(filePath) {
			c.Status(403)
			return
		}

		if !isDir(filePath) {
			os.Mkdir(filePath, 0744)
		}

		c.String(http.StatusOK, "Success")
	})

	g.POST("/moveFile", func(c *gin.Context) {
		src := c.DefaultPostForm("src", "")
		dest := c.DefaultPostForm("dest", "")

		if !checkPath(src) || !checkPath(dest) {
			c.Status(403)
			return
		}

		if !isFile(src) {
			c.Status(404)
			return
		}

		if isDir(dest) {
			c.Status(500)
			return
		}

		if filepath.Clean(src) != filepath.Clean(dest) {
			if isFile(dest) {
				err := os.Remove(dest)
				if err != nil {
					c.Status(500)
					return
				}
			}
			os.Rename(src, dest)
		}

		c.String(http.StatusOK, "Success")
	})

	g.POST("/deleteFile", func(c *gin.Context) {
		filePath := c.DefaultPostForm("name", "")

		if !checkPath(filePath) {
			c.Status(403)
			return
		}

		if isFile(filePath) {
			err := os.Remove(filePath)
			if err != nil {
				c.Status(500)
				return
			}
		} else if isDir(filePath) {
			err := os.RemoveAll(filePath)
			if err != nil {
				c.Status(500)
				return
			}
		}

		c.String(http.StatusOK, "Success")
	})

	g.POST("/games/upload.php", func(c *gin.Context) {
		c.String(http.StatusOK, "")
	})

	// Run("里面不指定端口号默认为8080")
	port := config.Port
	for isPortUsed(port) {
		port++
	}

	fmt.Println("============== 服务配置 ==============")
	fmt.Printf("监听端口：%d\n", port)
	fmt.Println()
	fmt.Printf("游戏地址: http://localhost:%d/\n", port)
	fmt.Printf("编辑器地址: http://localhost:%d/editor.html\n", port)
	fmt.Printf("\n")
	fmt.Println("============== 启动服务 ==============")

	// open(fmt.Sprintf("http://localhost:%d/", port))

	err := r.Run(":" + strconv.FormatInt(port, 10))
	if err != nil {
		fmt.Printf("!> 服务启动失败: %o", err)
		return
	}
}
