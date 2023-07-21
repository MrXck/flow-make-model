import {RectNode, RectNodeModel} from "@logicflow/core"

class UserTaskModel extends RectNodeModel {
    initNodeData(data) {
        super.initNodeData(data);

        const rule = {
            message: "只允许从右边的锚点连出",
            validate: (sourceNode, targetNode, sourceAnchor, targetAnchor) => {
                return sourceAnchor.name === "right";
            },
        };
        this.sourceRules.push(rule);
    }

    getAnchorStyle(anchorInfo) {
        const style = super.getAnchorStyle(anchorInfo);
        if (anchorInfo.type === "left") {
            style.fill = "red";
            style.hover.fill = "transparent";
            style.hover.stroke = "transpanrent";
            style.className = "lf-hide-default";
        } else {
            style.fill = "green";
        }
        return style;
    }

    getDefaultAnchor() {
        const {width, height, x, y, id} = this;
        return [
            {
                x: x - width / 2,
                y,
                type: "left",
                edgeAddable: false, // 控制锚点是否可以从此锚点手动创建连线。默认为true。
                id: `${id}_0`,
            },
            {
                x: x + width / 2,
                y,
                type: "right",
                id: `${id}_1`,
            },
        ];
    }
}

class UserTaskView extends RectNode {
}

export default {
    type: "UserTask",
    view: UserTaskView,
    model: UserTaskModel,
}