# Vue 3 + Typescript + Vite

This template should help get you started developing with Vue 3 and Typescript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar)

## Type Support For `.vue` Imports in TS

Since TypeScript cannot handle type information for `.vue` imports, they are shimmed to be a generic Vue component type by default. In most cases this is fine if you don't really care about component prop types outside of templates. However, if you wish to get actual prop types in `.vue` imports (for example to get props validation when using manual `h(...)` calls), you can enable Volar's `.vue` type support plugin by running `Volar: Switch TS Plugin on/off` from VSCode command palette.


## 争议点 if

```ts
// 最接近传统语言的方案，问题是三个块分离，容易用错
%if i > 5
    %return true
%elseif i < 3
    %return null
%else
    %return false
```

```ts
// if else 缺点是有两级缩进，可以考虑 elseif
%if i > 5
    &then
        %return true
    &elseif i < 3
        %return null
    &else
        %return false

// on 没有else分支的if  用来部分弥补if的缺点 (可选)
%on i > 5
    return true
```

```ts
// 用两个语句块表示 if 和 else 分支
%if i > 5
    %return true
    %return false

// 需要多行时这么处理
%if i > 5
    %do
        %return true
    %return false
```

## 争议点 script

```ts
// 支持返回值的形式
%script > i
let i = 0
return i + 5
```

```ts
// 是否需要增设简写模式，，(可选，初期可以先不增设
$: let i = 0
```

## 争议点 for

```ts
// 
%for 1;10 |> i

%for 1;10;2 |> i

%for [1,2,3] |> i
```

## 争议点 awaitall

可以先不做


## order 的能力

更类似于现实中的命令行

```
@bgm/play xxx > i
```


# 基本语法


 - 任何一段话都是一句对话

 - 
