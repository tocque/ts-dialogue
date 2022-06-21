import light_plus from "./light_plus.json";

export const lightplus = () => {
    return light_plus.rules.map(({ token, ...rest }) => {
        const styles = [];
        if (rest.foreground) {
            styles.push(`color: ${ rest.foreground };`);
        }
        if (rest.fontStyle) {
            styles.push(`font-style: ${ rest.fontStyle };`);
        }
        return /* CSS */`
        .${ token.replaceAll(".", "-") } {
            ${ styles.join("\n") }
        }`;
    }).join("\n");
};
