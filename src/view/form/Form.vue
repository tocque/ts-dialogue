<script setup lang="ts">
import { closeModal, modalSession } from "../state";
import { ref, shallowRef, watch } from 'vue';
import { Modal } from 'ant-design-vue';
import { getLineById, Line } from '@/model/line';
import { is } from "@/utils/type";
import { FormHandler } from "./type";
import { Statement, SyntaxKind } from "@/language/ast/define";
import AwaitVue from "./panel/Await.vue";
import BreakVue from "./panel/Break.vue";
import ContinueVue from "./panel/Continue.vue";
import CommentVue from "./panel/Comment.vue";
import IfVue from "./panel/If.vue";
import ReturnVue from "./panel/Return.vue";
import WhileVue from "./panel/While.vue";
import SetVue from "./panel/Set.vue";
import OrderVue from "./panel/Order.vue";

const create = ref(false);

const formComponent = shallowRef<any | undefined>(void 0);

let nowLine: Line | undefined = void 0;
let nowCollector: () => string = () => "";

const handleForm = is<FormHandler<any>>((init) => {
    nowCollector = init(nowLine!, nowLine!.node.getStatement());
});

const title = ref("");

watch(modalSession, (newValue) => {
    if (newValue === 0) {
        formComponent.value = void 0;
        return;
    }

    title.value = "";

    const line = getLineById(newValue);
    nowLine = line;

    const content = line.node.getContent();
    const statement = line.node.getStatement();
    // 如果是空的
    if (content === "") {
        create.value = true;
        title.value += "创建 - ";
    } else {
        create.value = false;
        title.value += "编辑 - ";
    }

    formComponent.value = (() => {
        switch (statement.kind) {
            case SyntaxKind.AwaitStatement:
                title.value += "等待";
                return AwaitVue;
            case SyntaxKind.BreakStatement:
                title.value += "跳出";
                return BreakVue;
            case SyntaxKind.CommentStatement:
                title.value += "注释";
                return CommentVue;
            case SyntaxKind.ContinueStatement:
                title.value += "跳过";
                return ContinueVue;
            case SyntaxKind.IfStatement:
                title.value += "条件分歧";
                return IfVue;
            case SyntaxKind.LoopStatement:
                title.value += "循环";
                return WhileVue;
            case SyntaxKind.ReturnStatement:
                title.value += "返回";
                return ReturnVue;
            case SyntaxKind.AssignStatement:
                title.value += "赋值";
                return SetVue;
            case SyntaxKind.OrderStatement:
                title.value += "指令";
                return OrderVue;
        }
    })();
});

const close = () => {
    nowLine = void 0;
    closeModal();
}

const handleOk = () => {
    nowLine!.setContent(nowCollector());
    close();
};

const handleCancel = () => {
    close();
};

</script>
<template>
    <Modal :visible="modalSession > 0"
        :title="title" width="600px"
        @ok="handleOk" @cancel="handleCancel"
    >
        <div v-if="create">
            <div></div>
        </div>
        <div v-else>
            <div v-if="formComponent">
                <component :is="formComponent" :handler="handleForm"></component>
            </div>
        </div>
    </Modal>
</template>