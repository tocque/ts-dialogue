import { Model } from "@/model";
import { unserialize } from "@/model/serializer";
import { ref, shallowRef } from "vue";

export const currentModel = shallowRef<Model | undefined>(void 0);

export const currentFile = ref<string | undefined>(void 0);

export function openFile(filename: string, content: string) {
    currentFile.value = filename;
    currentModel.value = new Model(unserialize(content));
}

export function closeFile() {
    currentFile.value = void 0;
    currentModel.value = void 0;
}

enum Config {
    EXPLORER_SHOW = "editor.explorer.show",
}

export const showExplorer = ref<boolean>(JSON.parse(localStorage.getItem(Config.EXPLORER_SHOW) ?? "true"));

export function toggleExplorer(show?: boolean) {
    show ??= !showExplorer.value;
    showExplorer.value = show;
    localStorage.setItem(Config.EXPLORER_SHOW, JSON.stringify(show));
}


export const modalSession = ref(0);

export const openModal = (id: number) => {
    modalSession.value = id;
};

export const closeModal = () => {
    modalSession.value = 0;
}
