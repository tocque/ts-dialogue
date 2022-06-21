<script setup lang="ts">
import { CommentStatement } from '@/language/ast/define';
import { takeText } from '@/language/ast/utils';
import { computed } from '@vue/reactivity';
import { Textarea } from 'ant-design-vue';
import { ref } from 'vue';
import { FormHandler } from '../type';

const props = defineProps<{ handler: FormHandler<CommentStatement> }>();

const comment = ref("");

const result = computed(() => {
    return `//${ comment.value }`;
});

props.handler((line, statement) => {

    const content = line.node.getContent();
    comment.value = takeText(content, statement.comment).slice(2);

    return () => {
        return result.value;
    };
});

</script>
<template>
    <div>
        <pre class="preview">{{ result }}</pre>
        <div class="form">
            <Textarea :auto-size="true" v-model:value="comment" />
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
