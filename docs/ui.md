# 行级编辑器

行级编辑器是一种新型的代码编辑工具，具体来说，它由一组带有缩进的文本块组成，用于表现树结构的代码

## 操作

行级编辑器的编辑由 文本块内的编辑 和 块间的树结构编辑 组成

### 文本块内的编辑

文本块内的编辑与传统的代码编辑器类似

特别的，上下移动时如果超出当前文本块，则会尝试向上或下移动

如果上下选中时超出当前文本块，则会变为行级选中

### 块间编辑

文本块间的编辑是对树进行的操纵

 - 新增同级行        : Shift + Enter
 - 新增子行          : Ctrl + Enter
 - 删除行            : Delete

 - 选择一行          : Ctrl + D

 - 移动到上一个同级行 : PageUp
 - 移动到下一个同级行 : pageDown

 - 回到父节点        : Home

## 语言服务

得益于源文本的天然分割，增量解析技术不再是必须的了，因此，解析器实现难度大幅度降低了

语言服务是

它包括一个虚拟FS，以及一组监听接口，用于响应变化

file.load

file.unload

line.update

line.add

line.remove

query.goto

query.reference

query.definition

query.type

diagnotisc
