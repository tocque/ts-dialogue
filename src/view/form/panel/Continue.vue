<script setup lang="ts">
import { ContinueStatement } from '@/language/ast/define';
import { computed } from '@vue/reactivity';
import { ref } from 'vue';
import { FormHandler } from '../type';

const props = defineProps<{ handler: FormHandler<ContinueStatement> }>();

const result = computed(() => {
    return `%continue`;
});

props.handler((line, statement) => {

    return () => {
        return result.value;
    };
});
</script>
<template>
    <div>
        <pre class="preview">{{ result }}</pre>
        <div class="form">
            没有可修改的参数
        </div>
    </div>
</template>

<style lang="less" scoped>
.preview {
    font-family: Consolas;
    padding: 2px 5px;
    background: #EEEEEE;
}
</style>
