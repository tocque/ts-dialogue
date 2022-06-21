<script setup lang="ts">
import { vfs } from '@/fs/vfs';
import { Model } from '@/model';
import { serialize, unserialize } from '@/model/serializer';
import { computed, ComputedRef } from 'vue';
import { currentFile, currentModel } from '../state';
import LineView from './LineView.vue';
import { lightplus } from "@/theme";

/**
 * @todo 粒度更细的热重载
 */
if (import.meta.hot) {
    import.meta.hot.decline();
}

const lineIds = computed(() => {
    if (!currentModel.value) return [];
    return currentModel.value.root.getChildrenIds().value;
});

document.addEventListener("keydown", (e) => {
    if (e.key === "s" && e.ctrlKey) {
        if (currentFile.value) {
            vfs.writeFile(currentFile.value, serialize(currentModel.value!.getValue()));
        }
        e.preventDefault();
    }
});

const style = document.createElement("style");
style.innerHTML = lightplus();
document.body.append(style);

</script>
<template>
    <div class="empty" v-if="!currentModel">
        <h3 class="main-result">打开文件以进行编辑操作</h3>
    </div>
    <div class="editor-view" v-else>
        <template v-for="lineId of lineIds" :key="lineId">
            <LineView :line-id="lineId"></LineView>
        </template>
    </div>
</template>
<style lang="less" scoped>
.empty {
    width: 100%;
    .main-result {
        font-size: 40px;
        color: rgba(0,0,0,0.35);
        margin: 160px auto 0;
        width: fit-content;
    }
}
.editor-view {
    width: 100%;
    height: 527px;
    overflow-y: auto;
}
</style>