(function (errors) {

const overlayClass = 'code-error-overlay';
const style = /*CSS*/`
.${ overlayClass } {position: fixed;z-index: 99999;top: 0;left: 0;width: 100%;height: 100%;overflow-y: scroll;margin: 0;background: rgba(0, 0, 0, 0.66);}

.${ overlayClass } .window {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    line-height: 1.5;
    width: 800px;
    color: #d8d8d8;
    margin: 30px auto;
    padding: 25px 40px;
    position: relative;
    background: #181818;
    border-radius: 6px 6px 8px 8px;
    box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);
    overflow: hidden;
    border-top: 8px solid #ff5555;
    direction: ltr;
    text-align: left;
}

.${ overlayClass } pre {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    font-size: 16px;
    margin-top: 0;
    margin-bottom: 1em;
    overflow-x: scroll;
    scrollbar-width: none;
}

.${ overlayClass } pre::-webkit-scrollbar {
    display: none;
}

.${ overlayClass } .message {
    line-height: 1.3;
    font-weight: 600;
    white-space: pre-wrap;
}

.${ overlayClass } .message-body {
    color: #ff5555;
}

.${ overlayClass } .plugin {
    color: #cfa4ff;
}

.${ overlayClass } .file {
    color: #2dd9da;
    margin-bottom: 0;
    white-space: pre-wrap;
    word-break: break-all;
}

.${ overlayClass } .frame {
    color: #e2aa53;
}

.${ overlayClass } .tip {
    font-size: 13px;
    color: #999;
    border-top: 1px dotted #999;
    padding-top: 13px;
}

.${ overlayClass } code {
    font-size: 13px;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    color: #e2aa53;
}
`

const errorTemplate = /*html*/ `
<pre class="message"><span class="plugin"></span><span class="message-body"></span></pre>
<pre class="file"></pre>
<pre class="frame"></pre>
`

function span(str, repeat) {
    let res = "";
    for (let i = 0; i < repeat; i++) res += str;
    return res;
}

const errorViews = errors.map(function (err) {
    const div = document.createElement("div");
    div.innerHTML = errorTemplate;
    const message = err.Text;
    const loc = err.Location;
    if (err.PluginName) {
        text('.plugin', `[plugin:${err.PluginName}] `);
    }
    text('.message-body', message.trim());
    const file = loc.File;
    text('.file', `${file}:${loc.Line}:${loc.Column}`);
    const linestr = loc.Line.toString();
    const frame = [
        ` ${ linestr } │ ${ loc.LineText }`,
        ` ${ span(" ", linestr.length) } ╵ ` + span(" ", loc.Column) + span("^", loc.Length)
    ].join("\n");loc.LineText;
    text('.frame', frame);
    return div.innerHTML;

    function text(selector, content) {
        const elm = div.querySelector(selector)
        if (elm) elm.innerText = content;
    }
}).join("<div class='tip'></div>")

const frameTemplate = /*html*/ `
<style>
    ${ style }
</style>
<div class="window">
    ${ errorViews }
    <div class="tip">
        点击蒙层关闭本窗口<br>
    </div>
</div>
`;

const root = document.createElement("div");
root.className = overlayClass;
root.innerHTML = frameTemplate;
root.querySelector('.window').addEventListener('click', function (e) {
    e.stopPropagation();
});
root.addEventListener('click', function () {
    root.remove(root);
});

document.body.appendChild(root);

})