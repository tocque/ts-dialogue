package main

// import (
// 	"bytes"
// 	"container/list"
// 	"crypto/md5"
// 	"encoding/json"
// 	"fmt"
// 	"os"
// 	"path"
// 	"regexp"
// 	"strings"
// 	"sync"
// 	"time"

// 	"github.com/evanw/esbuild/pkg/api"
// )

// func getLoader(filepath string) api.Loader {
// 	extname := path.Ext(filepath)
// 	switch extname {
// 	case ".js":
// 		return api.LoaderJS
// 	case ".ts":
// 		return api.LoaderTS
// 	case ".jsx":
// 		return api.LoaderJSX
// 	case ".tsx":
// 		return api.LoaderTSX
// 	default:
// 		return api.LoaderNone
// 	}
// }

// func fixPath(rawpath string) string {
// 	if strings.HasPrefix(rawpath, ".") || strings.HasPrefix(rawpath, "/") {
// 		return rawpath
// 	}
// 	if strings.HasPrefix(rawpath, "@/") {
// 		return string(rawpath[1:])
// 	}
// 	return "/node_modules/" + rawpath
// }

// var importPattern = regexp.MustCompile(`(import|from)\s*("[^./].*"|'[^./].*')`)

// func rewriteImportPath(source []byte) string {

// 	if !bytes.Contains(source, []byte("import")) {
// 		return string(source)
// 	}

// 	importres := importPattern.FindAllSubmatchIndex(source, -1)

// 	irl := len(importres)

// 	if irl == 0 {
// 		return string(source)
// 	}

// 	l := len(source)

// 	state := list.New()
// 	state.PushBack("@")

// 	irit := 0

// 	vaildMatch := list.New()

// 	for i := 0; i < l-5; i++ {
// 		ch := source[i]
// 		ns := state.Back().Value.(string)
// 		switch ns {
// 		case "{":
// 			fallthrough
// 		case "${":
// 			switch ch {
// 			case '}':
// 				state.Remove(state.Back())
// 			case '{':
// 				fallthrough
// 			case '"':
// 				fallthrough
// 			case '\'':
// 				state.PushBack(string(ch))
// 			case '/':
// 				if source[i+1] == '/' {
// 					state.PushBack("//")
// 					i++
// 				} else if source[i+1] == '*' {
// 					state.PushBack("/*")
// 					i++
// 				}
// 			}
// 		case "@":
// 			switch ch {
// 			case '{':
// 				fallthrough
// 			case '"':
// 				fallthrough
// 			case '\'':
// 				state.PushBack(string(ch))
// 			case '/':
// 				if source[i+1] == '/' {
// 					state.PushBack("//")
// 					i++
// 				} else if source[i+1] == '*' {
// 					state.PushBack("/*")
// 					i++
// 				}
// 			case 'f':
// 				fallthrough
// 			case 'i':
// 				for irit < irl && i > importres[irit][0] {
// 					irit++
// 				}
// 				if irit < irl && i == importres[irit][0] {
// 					match := importres[irit]
// 					rawpath := string(source[match[4]+1 : match[5]-1])
// 					path := fixPath(rawpath)
// 					if path != rawpath {
// 						vaildMatch.PushBack(match)
// 					}
// 					irit++
// 					if irit == irl {
// 						break
// 					}
// 					i = match[3] - 1
// 				}
// 			}
// 		case "'":
// 			fallthrough
// 		case "\"":
// 			if ch == '\\' {
// 				i++
// 			} else if string(ch) == ns {
// 				state.Remove(state.Back())
// 			}
// 		case "`":
// 			if ch == '$' && source[i+1] == '{' {
// 				state.PushBack("${")
// 				i++
// 			} else if ch == '\\' {
// 				i++
// 			} else if string(ch) == "`" {
// 				state.Remove(state.Back())
// 			}
// 		case "//":
// 			if ch == '\n' {
// 				state.Remove(state.Back())
// 			}
// 		case "/*":
// 			if ch == '*' && source[i+1] == '/' {
// 				state.Remove(state.Back())
// 			}
// 		}
// 		// 如果分析出错，则直接终止
// 		if state.Len() == 0 {
// 			break
// 		}
// 	}

// 	if vaildMatch.Len() == 0 {
// 		return string(source)
// 	}

// 	processed := strings.Builder{}
// 	processed.Grow(l + vaildMatch.Len()*20)

// 	lit := 0

// 	for i := vaildMatch.Front(); i != nil; i = i.Next() {
// 		match := i.Value.([]int)

// 		rawpath := string(source[match[4]+1 : match[5]-1])
// 		path := fixPath(rawpath)

// 		processed.Write(source[lit : match[4]+1])
// 		processed.WriteString(path)
// 		processed.WriteByte(source[match[5]-1])

// 		lit = match[5]
// 	}

// 	processed.Write(source[lit:l])

// 	return processed.String()
// }

// type CacheItem struct {
// 	sign    [16]byte
// 	content string
// }

// var codeCache = sync.Map{}

// //go:embed error.js
// var errorModal string

// func handleCodeFile(filePath string) (string, error) {
// 	bytes, err := os.ReadFile(filePath)
// 	cacheKey := path.Clean(filePath)
// 	cacheItem, exist := codeCache.Load(cacheKey)
// 	sign := md5.Sum(bytes)
// 	if exist && sign == cacheItem.(CacheItem).sign {
// 		fmt.Printf(`[code] "%s" hit cache\n`, cacheKey)
// 		return cacheItem.(CacheItem).content, nil
// 	}
// 	startTime := time.Now()
// 	if err != nil {
// 		return "", err
// 	}
// 	content := rewriteImportPath(bytes)
// 	loader := getLoader(filePath)
// 	fmt.Printf(`[code] "%s" preprocess cost = %10v\n`, cacheKey, time.Since(startTime))
// 	result := api.Transform(content, api.TransformOptions{
// 		Format:            api.FormatDefault,
// 		Loader:            loader,
// 		Sourcefile:        cacheKey,
// 		Sourcemap:         api.SourceMapNone,
// 		Target:            api.ES2015,
// 		MinifySyntax:      false,
// 		MinifyWhitespace:  false,
// 		MinifyIdentifiers: false,
// 		TreeShaking:       api.TreeShakingFalse,
// 		JSXMode:           api.JSXModeTransform,
// 		JSXFactory:        "h",
// 		JSXFragment:       "Fragment",
// 	})
// 	if len(result.Errors) > 0 {
// 		errorsJson, _ := json.Marshal(result.Errors)
// 		return fmt.Sprintf("const errors = (%s);%s", string(errorsJson), errorModal), nil
// 	}
// 	fmt.Printf(`[code] "%s" total cost = %10v\n`, cacheKey, time.Since(startTime))
// 	res := string(result.Code)
// 	codeCache.Store(cacheKey, CacheItem{
// 		sign:    sign,
// 		content: res,
// 	})
// 	return res, nil
// }
