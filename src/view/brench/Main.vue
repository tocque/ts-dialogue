<script setup lang="ts">
import { CaretRightOutlined, UnorderedListOutlined } from '@ant-design/icons-vue';
import EditorView from '../editor/EditorView.vue';
import { currentModel, showExplorer, toggleExplorer } from '../state';
import Explorer from './Explorer.vue';
import Form from '../form/Form.vue';
import { Button, CheckableTag } from 'ant-design-vue';
import { transpile } from '@/language/transpile';
import { serialize } from '@/model/serializer';

const run = () => {
    const doc = currentModel.value!.getValue();
    const code = transpile(serialize(doc));
    window.eval(code);
}

</script>

<template>
    <div class="brench">
        <div class="header">
            <h2 class="title">Dialogue</h2>
            <span class="version">v0.2.0</span>
        </div>
        <div class="bar">
            <CheckableTag
                :checked="showExplorer"
                @change="(checked: boolean) => toggleExplorer(checked)"
            >
                <UnorderedListOutlined /> 文件树
            </CheckableTag>
            <Button type="primary" :disabled="!currentModel" 
            class="run-btn" @click="run" size="small">
                <CaretRightOutlined /> 运行
            </Button>
        </div>
        <div class="main">
            <Explorer v-show="showExplorer"></Explorer>
            <EditorView></EditorView>
        </div>
        <Form />
    </div>
</template>

<style lang="less">
html, body, #app {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
}
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* text-align: center; */
    color: #2c3e50;
}
</style>
<style lang="less" scoped>
.brench {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}
.header {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    .title {
        margin-left: 20px;
    }
    .version {
        margin: 20px 10px;
        font-family: Consolas;
    }
}
.bar {
    background-color: #DDDDDD;
    padding: 5px 10px;
    display: flex;
    flex-direction: row;
    .run-btn {
        margin-left: auto;
    }
}
.main {
    display: flex;
    flex-direction: row;
    flex-grow: 1;
}
</style>
