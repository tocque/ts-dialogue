package main

// import (
// 	"bytes"
// 	"encoding/base64"
// 	"io/ioutil"
// 	"mime"
// 	"net/http"
// 	"net/url"
// 	"os"
// 	"path/filepath"
// 	"strconv"
// 	"strings"

// 	"github.com/gin-gonic/gin"
// )

// func brokenParamsHandler(c *gin.Context) {
// 	ct := c.Request.Header.Get("Content-Type")
// 	ct, _, _ = mime.ParseMediaType(ct)
// 	if ct == "text/plain" {
// 		c.Request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
// 		var bodyBytes []byte
// 		if c.Request.Body != nil {
// 			bodyBytes, _ = ioutil.ReadAll(c.Request.Body)
// 		}
// 		rawParam := string(bodyBytes)
// 		rawParamSpans := strings.Split(rawParam, "&")
// 		transformedSpans := make([]string, 0)
// 		for _, span := range rawParamSpans {

// 			kv := strings.SplitN(span, "=", 2)

// 			transformedSpans = append(transformedSpans, kv[0]+"="+url.QueryEscape(kv[1]))
// 		}
// 		transformed := strings.Join(transformedSpans, "&")
// 		c.Request.Body = ioutil.NopCloser(bytes.NewBuffer([]byte(transformed)))
// 	}
// 	c.Next()
// }

// func setupFSApi(r *gin.Engine) {

// 	g := r.Group(".", brokenParamsHandler)

// 	g.POST("/readFile", func(c *gin.Context) {
// 		tp := c.DefaultPostForm("type", "base64")
// 		filePath := c.DefaultPostForm("name", "")

// 		if !checkPath(filePath) {
// 			c.Status(403)
// 			return
// 		}

// 		if !isFile(filePath) {
// 			c.Status(404)
// 			return
// 		}

// 		bytes, err := os.ReadFile(filePath)

// 		if err != nil {
// 			c.Status(500)
// 			return
// 		}

// 		content := ""

// 		if tp == "utf-8" {
// 			content = string(bytes)
// 		} else {
// 			content = base64.StdEncoding.EncodeToString(bytes)
// 		}
// 		c.String(http.StatusOK, content)
// 	})

// 	g.POST("/writeFile", func(c *gin.Context) {
// 		tp := c.DefaultPostForm("type", "base64")
// 		filePath := c.DefaultPostForm("name", "")
// 		rawdata := c.DefaultPostForm("value", "")

// 		if !checkPath(filePath) {
// 			c.Status(403)
// 			return
// 		}

// 		var data []byte
// 		if tp == "base64" {
// 			k, err := base64.StdEncoding.DecodeString(rawdata)
// 			if err != nil {
// 				c.Status(500)
// 				return
// 			}
// 			data = k
// 		} else {
// 			data = []byte(rawdata)
// 		}

// 		err := os.WriteFile(filePath, data, os.ModeAppend)

// 		if err != nil {
// 			c.Status(500)
// 			return
// 		}
// 		c.String(http.StatusOK, strconv.FormatInt(int64(len(data)), 10))
// 	})

// 	g.POST("/writeMultiFiles", func(c *gin.Context) {
// 		tp := c.DefaultPostForm("type", "base64")
// 		filePathset := c.DefaultPostForm("name", "")
// 		rawdataset := c.DefaultPostForm("value", "")

// 		filePaths := strings.Split(filePathset, ";")
// 		rawdatas := strings.Split(rawdataset, ";")

// 		l := 0

// 		for i, filePath := range filePaths {

// 			if !checkPath(filePath) {
// 				c.Status(403)
// 				return
// 			}

// 			rawdata := rawdatas[i]

// 			var data []byte
// 			if tp == "base64" {
// 				k, err := base64.StdEncoding.DecodeString(rawdata)
// 				if err != nil {
// 					c.Status(500)
// 					return
// 				}
// 				data = k
// 			} else {
// 				data = []byte(rawdata)
// 			}

// 			err := os.WriteFile(filePath, data, os.ModeAppend)

// 			if err != nil {
// 				c.Status(500)
// 				return
// 			}

// 			l += len(data)
// 		}
// 		c.String(http.StatusOK, strconv.FormatInt(int64(l), 10))
// 	})

// 	g.POST("/listFile", func(c *gin.Context) {
// 		filePath := c.DefaultPostForm("name", "")

// 		if !checkPath(filePath) {
// 			c.Status(403)
// 			return
// 		}

// 		if !isDir(filePath) {
// 			c.Status(404)
// 			return
// 		}

// 		entries, err := os.ReadDir(filePath)
// 		if err != nil {
// 			c.Status(500)
// 			return
// 		}

// 		list := make([]string, 0)

// 		for _, entry := range entries {
// 			if !entry.IsDir() {
// 				name := entry.Name()
// 				list = append(list, name)
// 			}
// 		}

// 		c.JSON(http.StatusOK, list)
// 	})

// 	g.POST("/makeDir", func(c *gin.Context) {
// 		filePath := c.DefaultPostForm("name", "")

// 		if !checkPath(filePath) {
// 			c.Status(403)
// 			return
// 		}

// 		if !isDir(filePath) {
// 			os.Mkdir(filePath, os.ModePerm)
// 		}

// 		c.String(http.StatusOK, "Success")
// 	})

// 	g.POST("/moveFile", func(c *gin.Context) {
// 		src := c.DefaultPostForm("src", "")
// 		dest := c.DefaultPostForm("dest", "")

// 		if !checkPath(src) || !checkPath(dest) {
// 			c.Status(403)
// 			return
// 		}

// 		if !isFile(src) {
// 			c.Status(404)
// 			return
// 		}

// 		if isDir(dest) {
// 			c.Status(500)
// 			return
// 		}

// 		if filepath.Clean(src) != filepath.Clean(dest) {
// 			if isFile(dest) {
// 				err := os.Remove(dest)
// 				if err != nil {
// 					c.Status(500)
// 					return
// 				}
// 			}
// 			os.Rename(src, dest)
// 		}

// 		c.String(http.StatusOK, "Success")
// 	})

// 	g.POST("/deleteFile", func(c *gin.Context) {
// 		filePath := c.DefaultPostForm("name", "")

// 		if !checkPath(filePath) {
// 			c.Status(403)
// 			return
// 		}

// 		if isFile(filePath) {
// 			err := os.Remove(filePath)
// 			if err != nil {
// 				c.Status(500)
// 				return
// 			}
// 		} else if isDir(filePath) {
// 			err := os.RemoveAll(filePath)
// 			if err != nil {
// 				c.Status(500)
// 				return
// 			}
// 		}

// 		c.String(http.StatusOK, "Success")
// 	})

// 	g.POST("/games/upload.php", func(c *gin.Context) {
// 		c.String(http.StatusOK, "")
// 	})
// }
