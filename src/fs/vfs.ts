import { TreeProps } from "ant-design-vue/lib/vc-tree";
import axios from "axios";
import qs from "qs";
import { computed, ComputedRef, readonly, ref } from "vue";

async function readFile(path: string) {
    const { data } = await axios.post("/fs/readFile", qs.stringify({ 
        type: "utf-8", name: path
    }));
    return data;
}

async function writeFile(path: string, content: string) {
    const { data } = await axios.post("/fs/writeFile", qs.stringify({ 
        type: "utf-8", name: path, value: content
    }));
    return data;
}

async function listFile(path: string) {
    const { data } = await axios.post("/fs/listFile", qs.stringify({ 
        name: path
    }));
    return data as string[];
}

class VirtualFS {
    private workdir = "work/";

    readonly cache: Record<string, string> = {};

    private _tree = ref<TreeProps['treeData']>([]);

    tree: ComputedRef<TreeProps['treeData']>;

    constructor() {
        this.tree = computed(() => this._tree.value);
    }

    private static async fetchList(path: string) {
        const files = await listFile(path);
        return files.map((file) => ({ key: path + file, title: file }));
    }

    async reload() {
        this._tree.value = await VirtualFS.fetchList(this.workdir);
    }

    async readFile(path: string) {
        console.log(path);
        if (!this.cache[path]) {
            this.cache[path] = await readFile(path);
        }
        return this.cache[path];
    }

    async writeFile(path: string, content: string) {
        console.log(path);
        this.cache[path] = content;
        await writeFile(path, content);
    }
}

export const vfs = new VirtualFS();
