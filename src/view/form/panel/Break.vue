<script setup lang="ts">
import { BreakStatement } from '@/language/ast/define';
import { computed } from '@vue/reactivity';
import { ref } from 'vue';
import { FormHandler } from '../type';

const props = defineProps<{ handler: FormHandler<BreakStatement> }>();

const result = computed(() => {
    return `%break`;
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