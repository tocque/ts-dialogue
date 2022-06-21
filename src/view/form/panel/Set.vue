<script setup lang="ts">
import { AssignStatement } from '@/language/ast/define';
import { takeText } from '@/language/ast/utils';
import { computed } from '@vue/reactivity';
import { Input, Textarea } from 'ant-design-vue';
import { ref } from 'vue';
import { FormHandler } from '../type';

const props = defineProps<{ handler: FormHandler<AssignStatement> }>();

const left = ref("");
const right = ref("");

const result = computed(() => {
    return `%set ${ left.value } = ${ right.value }`;
});

props.handler((line, statement) => {

    const content = line.node.getContent();
    left.value = takeText(content, statement.left);
    right.value = takeText(content, statement.right);

    return () => {
        return result.value;
    };
});

</script>
<template>
    <div>
        <pre class="preview">{{ result }}</pre>
        <div class="form">
            <a-divider orientation="left" style="margin: 8px 0; border-top-color: rgba(0, 0, 0, 0.35)">赋予值的对象</a-divider>
            <Input v-model:value="left" />
            <a-divider orientation="left" style="margin: 8px 0; border-top-color: rgba(0, 0, 0, 0.35)">要赋予的值</a-divider>
            <Textarea :auto-size="true" v-model:value="right" />
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
