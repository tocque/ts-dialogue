<script setup lang="ts">
import { Button, DirectoryTree, TreeProps } from 'ant-design-vue';
import { ref } from 'vue';
import { vfs } from '@/fs/vfs';
import { FileAddOutlined, FolderAddOutlined, ReloadOutlined } from '@ant-design/icons-vue';
import { is } from '@/utils/type';
import { openFile, closeFile } from "../state";
import { transpile } from '@/language/transpile';

const expandedKeys = ref<string[]>([]);
const selectedKeys = ref<string[]>([]);

const loading = ref(false);

const onSelect = is<TreeProps['onSelect']>(async (keys) => {
    if (keys.length > 0) {
        loading.value = true;
        const file = await vfs.readFile(keys[0] as string);
        openFile(keys[0] as string, file);
        loading.value = false;
    } else {
        closeFile();
    }
});

const reload = () => {
    loading.value = true;
    vfs.reload().then(() => {
        loading.value = false;
    });
}
reload();

</script>
<template>
    <div class="explorer">
        <div class="bar">
            <div class="path">work/</div>
            <Button type="text" size="small"
                :disabled="loading" @click="reload"
            >
                <ReloadOutlined />
            </Button>
            <Button type="text" size="small">
                <FileAddOutlined />
            </Button>
            <Button type="text" size="small">
                <FolderAddOutlined />
            </Button>
        </div>
        <DirectoryTree
            :disabled="loading"
            @select="onSelect"
            v-model:expandedKeys="expandedKeys"
            v-model:selectedKeys="selectedKeys"
            :tree-data="vfs.tree.value"
        ></DirectoryTree>
    </div>
</template>

<style lang="less" scoped>
.explorer {
    width: 240px;
    flex-shrink: 0;
    background-color: #EEEEEE;
    &::v-deep .ant-tree {
        background-color: #EEEEEE;
    }
    .bar {
        background-color: #E1E1E1;

        display: flex;
        flex-direction: row;

        .path {
            margin-left: 5px;
            margin-right: auto;
            font-weight: bold;
        }
    }
}
</style>