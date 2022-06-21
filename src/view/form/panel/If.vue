<script setup lang="ts">
import { IfStatement } from '@/language/ast/define';
import { takeText } from '@/language/ast/utils';
import { computed } from '@vue/reactivity';
import { Textarea } from 'ant-design-vue';
import { ref } from 'vue';
import { FormHandler } from '../type';

const props = defineProps<{ handler: FormHandler<IfStatement> }>();

const expression = ref("");

const result = computed(() => {
    return `%if ${ expression.value }`;
});

props.handler((line, statement) => {

    const content = line.node.getContent();
    expression.value = takeText(content, statement.condition);

    return () => {
        return result.value;
    };
});

</script>
<template>
    <div>
        <pre class="preview">{{ result }}</pre>
        <div class="form">
            <a-divider orientation="left" style="margin: 8px 0; border-top-color: rgba(0, 0, 0, 0.35)">条件</a-divider>
            <Textarea :auto-size="true" v-model:value="expression" />
        </div>
    </div>
</template>

<style lang="less" scoped>
.preview {
    font-family: Consolas;
    padding: 2px 5px;
    background: #EEEEEE;
}
.form {
    font-family: Consolas;
}
</style>
