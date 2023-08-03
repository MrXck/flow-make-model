<template>
  <div>
    <a-dropdown style="margin-bottom: 10px;z-index: 999" v-model="xlsxData[nodeId].DropdownVisible">
      <a-menu slot="overlay">
        <a-menu-item v-for="(column, columnIndex) in xlsxData[nodeId].columns" :key="columnIndex">
          <a-checkbox :checked="column.show"
                      @change="(e)=>{xlsxData[nodeId].columnsCheck(e.target.checked,xlsxData[nodeId].columns,columnIndex)}">
            {{ column.title }}
          </a-checkbox>
        </a-menu-item>
      </a-menu>
      <a-button style="margin-left: 8px"> 筛选列
        <a-icon type="down"/>
      </a-button>
    </a-dropdown>
    <a-button @click="exportXlsx(handleFunction(rule, xlsxData[nodeId].data), '导出结果')"
              style="margin-left: 10px">导出数据
    </a-button>
    <a-table
        :rowKey="(record,index)=>{return index}"
        style="margin-top: 10px"
        :columns="xlsxData[nodeId].columns.filter((col,num)=>{if(col.show){return col}})"
        :data-source="handleFunction(rule, xlsxData[nodeId].data)"
        :pagination="xlsxData[nodeId].pagination"
        bordered
        @change="(pagination, filters, sorter)=>{xlsxData[nodeId].pagination = pagination}">
    </a-table>
  </div>
</template>

<script>
import {exportXlsx} from "@/utils/execute";

export default {
  name: "AfterTable",
  props: {
    xlsxData: {
      type: Object,
      require: true
    },
    nodeId: {
      type: Number,
      require: true
    },
    showExport: {
      type: Boolean,
      default: true
    },
    rule: {
      require: true
    },
    handleFunction: {
      type: Function,
      require: true
    }
  },
  methods: {
    exportXlsx(data, filename) {
      exportXlsx(data, filename)
    }
  }
}
</script>

<style scoped>

</style>