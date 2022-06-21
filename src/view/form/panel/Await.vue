<script setup lang="ts">
import { AwaitStatement } from '@/language/ast/define';
import { takeText } from '@/language/ast/utils';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { computed } from '@vue/reactivity';
import { Button, Input, Select } from 'ant-design-vue';
import { ref } from 'vue';
import { FormHandler } from '../type';

const props = defineProps<{ handler: FormHandler<AwaitStatement> }>();

const list = ref<[ string, string? ][]>([]);

const result = computed(() => {
    const liststr = list.value.map(([ source, target ]) => {
        if (!target) return source;
        return `${ source } > ${ target }`;
    }).join(", ");

    return `%await ${ liststr }`;
});

const options = [
    { title: "i", value: "i" },
    { title: "i2", value: "i2" },
];

props.handler((line, statement) => {

    const content = line.node.getContent();

    list.value = statement.list.map((expression) => {
        const source = takeText(content, expression.source);
        if (!expression.output) {
            return [ source ];
        }
        return [ source, takeText(content, expression.output.target) ];
    });

    return () => {
        return result.value;
    };
});

const remove = (index: number) => {
    list.value.splice(index, 1);
}

const useTarget = (index: number) => {
    list.value[index] = [ list.value[index][0], "" ];
}

const dropTarget = (index: number) => {
    list.value[index] = [ list.value[index][0] ];
}

const append = () => {
    list.value.push([ "" ]);
}
</script>
<template>
    <div>
        <pre class="preview">{{ result }}</pre>
        <div class="form">
            <a-divider orientation="left" style="margin: 8px 0; border-top-color: rgba(0, 0, 0, 0.35)">要等待的任务</a-divider>
            <div v-for="(item, index) of list" class="list-item">
                <div class="source">
                    <Select
                        v-model:value="item[0]"
                        :options="options"
                        size="small"
                        style="width: 180px"
                    ></Select>
                </div>
                <div v-if="item[1] !== void 0" class="target">
                    <span class="operator">></span>
                    <Input v-model:value="item[1]" size="small" />
                    <Button type="link" size="small" @click="dropTarget(index)">
                        移除输出目标
                    </Button>
                </div>
                <div v-else class="target">
                    <Button type="link" size="small" @click="useTarget(index)">
                        > 设置输出目标
                    </Button>
                </div>
                <div class="remove-btn">
                    <Button type="text" size="small" @click="remove(index)">
                        <CloseOutlined />
                    </Button>
                </div>
            </div>
            <div class="list-item append-btn" @click="append">
                <PlusOutlined />
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
.list-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-family: Consolas;

    margin: 5px;
    padding: 2px;
    height: 32px;
    background-color: #EEEEEE;
    box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.35);
}
.source {
    margin-left: 5px;
}
.target {
    display: flex;
    flex-direction: row;
    align-items: center;
}
.remove-btn {
    margin-left: auto;
}
.append-btn {
    cursor: pointer;
    justify-content: center;
}
.operator {
    margin: 0 10px;
}
</style>