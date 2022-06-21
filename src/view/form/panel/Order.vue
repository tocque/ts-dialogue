<script setup lang="ts">
import { OrderStatement, SyntaxKind } from '@/language/ast/define';
import { takeText } from '@/language/ast/utils';
import { OrderManager, Param } from '@/language/type/order';
import { computed } from '@vue/reactivity';
import { Button, Input, Textarea } from 'ant-design-vue';
import { ref } from 'vue';
import { FormHandler } from '../type';

const props = defineProps<{ handler: FormHandler<OrderStatement> }>();

type ParamValue = [ string, number ];

const define = ref<Param[]>([]);
const paramValues = ref<ParamValue[]>([]);
const output = ref<string | undefined>(void 0);
const orderName = ref("");

const result = computed(() => {
    const outputstr = output.value ? ` > ${ output.value }` : "";
    const paramstr = paramValues.value.map((paramValue) => {
        switch (paramValue[1]) {
            case 0: return paramValue[0];
            case 1: return `"${ paramValue[0] }"`;
            case 2: return `$\{${ paramValue[0] }}`;
        }
    }).join(" ");
    return `@${ orderName.value } ${ paramstr } ${ outputstr }`;
});

props.handler((line, statement) => {

    const content = line.node.getContent();
    const method = takeText(content, statement.main.header.name);
    const defination = OrderManager.get(method)!;
    orderName.value = method;
    define.value = defination.params;
    paramValues.value = statement.main.paramList.defaultParamGroup.params.map((param) => {
        const value = takeText(content, param.content);
        switch (param.content.kind) {
            case SyntaxKind.Literal: return [ value, 0 ];
            case SyntaxKind.QuotedLiteral: return [ value, 1 ];
            case SyntaxKind.Expression: return [ value, 2 ];
        }
    });
    if (statement.main.output) {
        output.value = takeText(content, statement.main.output.target);
    } else {
        output.value = void 0;
    }

    return () => {
        return result.value;
    };
});

const useTarget = () => {
    output.value = "";
}

const dropTarget = () => {
    output.value = void 0;
}
</script>
<template>
    <div>
        <pre class="preview">{{ result }}</pre>
        <div class="form">
            <a-divider orientation="left" style="margin: 8px 0; border-top-color: rgba(0, 0, 0, 0.35)">输出目标</a-divider>
            <div v-if="!output">
                <Button type="link" size="small" @click="useTarget()">
                    > 设置输出目标
                </Button>
            </div>
            <div v-else class="target">
                <span class="operator">></span>
                <Input v-model:value="output" style="width: 200px" size="small" />
                <Button type="link" size="small" @click="dropTarget()">
                    移除输出目标
                </Button>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.preview {
    font-family: Consolas;
    padding: 2px 5px;
    background: #EEEEEE;
}
.target {
    display: flex;
    flex-direction: row;
    align-items: center;
}
.operator {
    margin: 0 10px;
}
.form {
    font-family: Consolas;
}
</style>
