<template>
  <div id="app" style="height: 100vh;width: 100vw">
    <div id="container" style="height: 100vh;width: 100vw"></div>
    <router-view/>
    <a-drawer
        :title="config.title"
        placement="bottom"
        height="400"
        :closable="true"
        :visible="draw.upload"
        @close="onClose"
        :zIndex="10"
        :destroyOnClose="true"
    >
      <a-upload
          name="file"
          :before-upload="beforeUpload"
          :showUploadList="false"
      >
        <p>请将所有需要数据移至第一个Sheet再上传</p>
        <p>同时将标题放在第一个Sheet的第一行</p>
        <a-button>
          <a-icon type="upload"/>
          上传
        </a-button>
      </a-upload>
      <a-row v-if="draw.upload && nowOption.id in xlsxData">
        <div v-for="item in xlsxData[nowOption.id]">
          <a-dropdown style="margin-bottom: 10px;z-index: 999" v-model="item.DropdownVisible">
            <a-menu slot="overlay">
              <a-menu-item v-for="(column, columnIndex) in item.columns" :key="columnIndex">
                <a-checkbox :checked="column.show"
                            @change="(e)=>{item.columnsCheck(e.target.checked,item.columns,columnIndex)}">
                  {{ column.title }}
                </a-checkbox>
              </a-menu-item>
            </a-menu>
            <a-button style="margin-left: 8px"> 筛选列
              <a-icon type="down"/>
            </a-button>
          </a-dropdown>
          <a-table
              style="margin-top: 10px"
              :columns="item.columns.filter((col,num)=>{if(col.show){return col}})"
              :data-source="item.data"
              :pagination="item.pagination"
              bordered
              @change="(pagination, filters, sorter)=>{item.pagination = pagination}">
          </a-table>
        </div>
      </a-row>
    </a-drawer>

    <a-drawer
        :title="config.title"
        placement="bottom"
        height="400"
        :closable="true"
        :visible="draw.dataFilter"
        @close="onClose"
        :zIndex="10"
        :destroyOnClose="true"
    >
      <p>数据筛选配置</p>
      <div v-if="draw.dataFilter && nowOption.id in xlsxData">
        <div v-if="nowOption.filterRules.length !== 0">
          <a-button @click="saveFilterRules">保存配置</a-button>
          <a-button style="margin-left: 10px" v-show="!nowOption.preview" @click="nowOption.preview = true">预览
          </a-button>
          <a-button style="margin-left: 10px" v-show="nowOption.preview" @click="nowOption.preview = false">取消预览
          </a-button>
          <div class="filter-item" v-for="(rowItem, rowIndex) in nowOption.filterRules">
            <a-select :default-value="rowItem.column !== '' ? rowItem.column : '请选择字段'" style="width: 300px">
              <a-select-option v-for="(item, index) in xlsxData[nowOption.id].columnList" :key="index" :value="item"
                               @click="handleChange(rowIndex, 'column', item)">
                {{ item }}
              </a-select-option>
            </a-select>
            <a-select :default-value="rowItem.filterRule !== '' ? rowItem.filterRule : '请选择筛选规则'"
                      style="width: 300px;margin: 0 10px">
              <a-select-option v-for="(item, index) in filterConfig.filterItem" :key="index" :value="index"
                               @click="handleChange(rowIndex, 'filterRule', item.value)">
                {{ item.desc }}
              </a-select-option>
            </a-select>

            <a-input style="width: 300px" v-model="nowOption.filterRules[rowIndex].start" @input="notPreview"/>

            <a-button style="margin-left: 10px" @click="addFilterRule">添加配置</a-button>
          </div>
        </div>
        <div v-if="nowOption.filterRules.length === 0">
          <a-button @click="addFilterRule">添加配置</a-button>
        </div>

        <a-row v-if="draw.dataFilter && nowOption.id in xlsxData">
          <p>筛选前</p>
          <a-dropdown style="margin-bottom: 10px;z-index: 999" v-model="xlsxData[nowOption.id].DropdownVisible">
            <a-menu slot="overlay">
              <a-menu-item v-for="(column, columnIndex) in xlsxData[nowOption.id].columns" :key="columnIndex">
                <a-checkbox :checked="column.show"
                            @change="(e)=>{xlsxData[nowOption.id].columnsCheck(e.target.checked,xlsxData[nowOption.id].columns,columnIndex)}">
                  {{ column.title }}
                </a-checkbox>
              </a-menu-item>
            </a-menu>
            <a-button style="margin-left: 8px"> 筛选列
              <a-icon type="down"/>
            </a-button>
          </a-dropdown>
          <a-table
              style="margin-top: 10px"
              :columns="xlsxData[nowOption.id].columns.filter((col,num)=>{if(col.show){return col}})"
              :data-source="xlsxData[nowOption.id].data"
              :pagination="xlsxData[nowOption.id].pagination"
              bordered
              @change="(pagination, filters, sorter)=>{xlsxData[nowOption.id].pagination = pagination}">
          </a-table>
        </a-row>

        <a-row v-if="draw.dataFilter && nowOption.id in xlsxData && nowOption.preview">
          <p>筛选后</p>
          <a-dropdown style="margin-bottom: 10px;z-index: 999" v-model="xlsxData[nowOption.id].DropdownVisible">
            <a-menu slot="overlay">
              <a-menu-item v-for="(column, columnIndex) in xlsxData[nowOption.id].columns" :key="columnIndex">
                <a-checkbox :checked="column.show"
                            @change="(e)=>{xlsxData[nowOption.id].columnsCheck(e.target.checked,xlsxData[nowOption.id].columns,columnIndex)}">
                  {{ column.title }}
                </a-checkbox>
              </a-menu-item>
            </a-menu>
            <a-button style="margin-left: 8px"> 筛选列
              <a-icon type="down"/>
            </a-button>
          </a-dropdown>
          <a-table
              style="margin-top: 10px"
              :columns="xlsxData[nowOption.id].columns.filter((col,num)=>{if(col.show){return col}})"
              :data-source="filterData(xlsxData[nowOption.id].data)"
              :pagination="xlsxData[nowOption.id].pagination"
              bordered
              @change="(pagination, filters, sorter)=>{xlsxData[nowOption.id].pagination = pagination}">
          </a-table>
        </a-row>
      </div>
    </a-drawer>
  </div>
</template>

<script>
import LogicFlow from '@logicflow/core'
import "@logicflow/core/dist/style/index.css"
import {Control, DndPanel, Menu, SelectionSelect} from '@logicflow/extension'
import '@logicflow/extension/lib/style/index.css'
import {read, utils} from "xlsx";

export default {
  name: "App",
  data() {
    return {
      visible: false,
      config: {
        title: ''
      },
      draw: {
        upload: false,
        dataFilter: false
      },
      nowOption: {
        id: 0,
        filterRules: [
          {
            start: '',
            filterRule: '',
            column: '',
            type: 'and'
          }
        ],
        preview: false
      },
      lf: null,
      xlsxData: {},
      filterConfig: {
        filterItem: [
          {
            desc: '等于',
            value: ' == '
          },
          {
            desc: '不等于',
            value: ' != '
          },
          {
            desc: '包含',
            value: '.includes'
          },
          {
            desc: '大于',
            value: ' > '
          },
          {
            desc: '小于',
            value: ' < '
          },
          {
            desc: '大于等于',
            value: ' >= '
          },
          {
            desc: '小于等于',
            value: ' <= '
          },
          {
            desc: '正则表达式',
            value: '.match'
          },
        ]
      }
    }
  },
  methods: {
    onClose() {
      let keys = Object.keys(this.draw)
      for (let i = 0; i < keys.length; i++) {
        this.draw[keys[i]] = false
      }
    },
    async beforeUpload(file) {
      const isExcel = file.type === 'application/vnd.ms-excel' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'text/csv'
      if (!isExcel) {
        this.$message.error('只能上传 xlsx xls csv格式')
        return
      }
      const data = await this.readFile(file)
      const workbook = read(data, {type: 'binary', cellDates: true})
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const result = utils.sheet_to_json(worksheet)
      const keys = Object.keys(result[0])
      const columns = []
      const columnList = []
      for (let i = 0; i < keys.length; i++) {
        columns.push({title: keys[i], dataIndex: keys[i], key: keys[i], show: true})
        columnList.push(keys[i])
      }
      this.$set(this.xlsxData, this.nowOption.id, [
        {
          show: true,
          data: result,
          columns: columns,
          columnList: columnList,
          DropdownVisible: false,
          columnsCheck: (checked, data, index) => {
            data[index].show = checked
          },
          pagination: {
            size: 'large',
            current: 1,
            pageSize: 10,
            pageSizeOptions: ['10', '20', '30'],
            showTotal: (total, range) => {
              return '共' + total + '条'
            },
            hideOnSinglePage: false,
            showQuickJumper: true,
            showSizeChanger: true
          },
        }
      ])
    },
    readFile(file) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.readAsBinaryString(file)
        reader.onload = (ev) => {
          resolve(ev.target.result)
        }
      })
    },
    handleChange(rowIndex, property, value) {
      this.nowOption.filterRules[rowIndex][property] = value
      this.notPreview()
    },
    addFilterRule() {
      this.nowOption.filterRules.push({
        start: '',
        filterRule: '',
        column: '',
        type: 'and'
      })
    },
    saveFilterRules() {
      const properties = this.lf.getProperties(this.nowOption.id)
      properties.filterRules = this.nowOption.filterRules
      this.lf.setProperties(this.nowOption.id, properties)
      console.log(this.lf.getProperties(this.nowOption.id))
    },
    filterData(dataList) {
      let list = JSON.parse(JSON.stringify(dataList))
      let evalString = ''
      for (let i = 0; i < this.nowOption.filterRules.length; i++) {
        const rule = this.nowOption.filterRules[i]
        if (rule.filterRule.startsWith('.')) {
          if (i === 0) {
            if (rule.filterRule === '.match') {
              evalString += `/${rule.start}/.test(data['${rule.column}'].toString())`
            } else {
              evalString += `data['${rule.column}'].toString()${rule.filterRule}('${rule.start}')`
            }
          } else {
            if (rule.type === 'and') {
              evalString += ` && `
            } else {
              evalString += ` || `
            }
            if (rule.filterRule === '.match') {
              evalString += `/${rule.start}/.test(data['${rule.column}'].toString())`
            } else {
              evalString += `data['${rule.column}'].toString()${rule.filterRule}('${rule.start}')`
            }
          }
        } else {
          if (i === 0) {
            evalString += `data['${rule.column}']${rule.filterRule}'${rule.start}'`
          } else {
            if (rule.type === 'and') {
              evalString += ` && data['${rule.column}']${rule.filterRule}'${rule.start}'`
            } else {
              evalString += ` || data['${rule.column}']${rule.filterRule}'${rule.start}'`
            }
          }
        }

      }
      console.log(evalString)
      list = list.filter((data, index, arr) => {
        return eval(evalString)
      })
      return list
    },
    notPreview() {
      // this.$set(this.nowOption, 'preview', false)
      this.nowOption.preview = false
    }
  },
  mounted() {
    const lf = new LogicFlow({
      container: document.querySelector("#container"),
      grid: {
        size: 20,
        visible: true,
        type: 'mesh',
        config: {
          color: '#ababab',
          thickness: 1,
        },
      },
      keyboard: {
        enabled: true
      },
      plugins: [Menu, DndPanel, SelectionSelect, Control]
    })
    lf.extension.menu.addMenuConfig({
      nodeMenu: [
        {
          text: "分享",
          callback() {
            alert("分享成功！");
          },
        },
        {
          text: "属性",
          callback(node) {
            alert(`
          节点id：${node.id}
          节点类型：${node.type}
          节点坐标：(x: ${node.x}, y: ${node.y})`);
          },
        },
      ],
      edgeMenu: [
        {
          text: "属性",
          callback(edge) {
            alert(`
          边id：${edge.id}
          边类型：${edge.type}
          边坐标：(x: ${edge.x}, y: ${edge.y})
          源节点id：${edge.sourceNodeId}
          目标节点id：${edge.targetNodeId}`);
          },
        },
      ],
      graphMenu: [
        {
          text: "分享",
          callback() {
            alert("分享成功！");
          },
        },
      ],
    });

    lf.extension.dndPanel.setPatternItems([
      {
        label: '选区',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAAH6ji2bAAAABGdBTUEAALGPC/xhBQAAAOVJREFUOBGtVMENwzAIjKP++2026ETdpv10iy7WFbqFyyW6GBywLCv5gI+Dw2Bluj1znuSjhb99Gkn6QILDY2imo60p8nsnc9bEo3+QJ+AKHfMdZHnl78wyTnyHZD53Zzx73MRSgYvnqgCUHj6gwdck7Zsp1VOrz0Uz8NbKunzAW+Gu4fYW28bUYutYlzSa7B84Fh7d1kjLwhcSdYAYrdkMQVpsBr5XgDGuXwQfQr0y9zwLda+DUYXLaGKdd2ZTtvbolaO87pdo24hP7ov16N0zArH1ur3iwJpXxm+v7oAJNR4JEP8DoAuSFEkYH7cAAAAASUVORK5CYII=',
        callback: () => {
          lf.extension.selectionSelect.openSelectionSelect();
          lf.once('selection:selected', () => {
            lf.extension.selectionSelect.closeSelectionSelect();
          });
        }
      },
      {
        type: 'circle',
        text: '开始',
        label: '开始节点',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAAH6ji2bAAAABGdBTUEAALGPC/xhBQAAAnBJREFUOBGdVL1rU1EcPfdGBddmaZLiEhdx1MHZQXApraCzQ7GKLgoRBxMfcRELuihWKcXFRcEWF8HBf0DdDCKYRZpnl7p0svLe9Zzbd29eQhTbC8nv+9zf130AT63jvooOGS8Vf9Nt5zxba7sXQwODfkWpkbjTQfCGUd9gIp3uuPP8bZ946g56dYQvnBg+b1HB8VIQmMFrazKcKSvFW2dQTxJnJdQ77urmXWOMBCmXM2Rke4S7UAW+/8ywwFoewmBps2tu7mbTdp8VMOkIRAkKfrVawalJTtIliclFbaOBqa0M2xImHeVIfd/nKAfVq/LGnPss5Kh00VEdSzfwnBXPUpmykNss4lUI9C1ga+8PNrBD5YeqRY2Zz8PhjooIbfJXjowvQJBqkmEkVnktWhwu2SM7SMx7Cj0N9IC0oQXRo8xwAGzQms+xrB/nNSUWVveI48ayrFGyC2+E2C+aWrZHXvOuz+CiV6iycWe1Rd1Q6+QUG07nb5SbPrL4426d+9E1axKjY3AoRrlEeSQo2Eu0T6BWAAr6COhTcWjRaYfKG5csnvytvUr/WY4rrPMB53Uo7jZRjXaG6/CFfNMaXEu75nG47X+oepU7PKJvvzGDY1YLSKHJrK7vFUwXKkaxwhCW3u+sDFMVrIju54RYYbFKpALZAo7sB6wcKyyrd+aBMryMT2gPyD6GsQoRFkGHr14TthZni9ck0z+Pnmee460mHXbRAypKNy3nuMdrWgVKj8YVV8E7PSzp1BZ9SJnJAsXdryw/h5ctboUVi4AFiCd+lQaYMw5z3LGTBKjLQOeUF35k89f58Vv/tGh+l+PE/wG0rgfIUbZK5AAAAABJRU5ErkJggg==',
        properties: {
          type: 'upload',
        }
      },
      {
        type: 'rect',
        text: '数据过滤',
        label: '数据过滤',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAEFVwZaAAAABGdBTUEAALGPC/xhBQAAAqlJREFUOBF9VM9rE0EUfrMJNUKLihGbpLGtaCOIR8VjQMGDePCgCCIiCNqzCAp2MyYUCXhUtF5E0D+g1t48qAd7CCLqQUQKEWkStcEfVGlLdp/fm3aW2QQdyLzf33zz5m2IsAZ9XhDpyaaIZkTS4ASzK41TFao88GuJ3hsr2pAbipHxuSYyKRugagICGANkfFnNh3HeE2N0b3nN2cgnpcictw5veJIzxmDamSlxxQZicq/mflxhbaH8BLRbuRwNtZp0JAhoplVRUdzmCe/vO27wFuuA3S5qXruGdboy5/PRGFsbFGKo/haRtQHIrM83bVeTrOgNhZReWaYGnE4aUQgTJNvijJFF4jQ8BxJE5xfKatZWmZcTQ+BVgh7s8SgPlCkcec4mGTmieTP4xd7PcpIEg1TX6gdeLW8rTVMVLVvb7ctXoH0Cydl2QOPJBG21STE5OsnbweVYzAnD3A7PVILuY0yiiyDwSm2g441r6rMSgp6iK42yqroI2QoXeJVeA+YeZSa47gZdXaZWQKTrG93rukk/l2Al6Kzh5AZEl7dDQy+JjgFahQjRopSxPbrbvK7GRe9ePWBo1wcU7sYrFZtavXALwGw/7Dnc50urrHJuTPSoO2IMV3gUQGNg87IbSOIY9BpiT9HV7FCZ94nPXb3MSnwHn/FFFE1vG6DTby+r31KAkUktB3Qf6ikUPWxW1BkXSPQeMHHiW0+HAd2GelJsZz1OJegCxqzl+CLVHa/IibuHeJ1HAKzhuDR+ymNaRFM+4jU6UWKXorRmbyqkq/D76FffevwdCp+jN3UAN/C9JRVTDuOxC/oh+EdMnqIOrlYteKSfadVRGLJFJPSB/ti/6K8f0CNymg/iH2gO/f0DwE0yjAFO6l8JaR5j0VPwPwfaYHqOqrCI319WzwhwzNW/aQAAAABJRU5ErkJggg==',
        className: 'important-node',
        properties: {
          type: 'dataFilter',
        }
      },
      {
        type: 'rect',
        label: '系统任务',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAEFVwZaAAAABGdBTUEAALGPC/xhBQAAAqlJREFUOBF9VM9rE0EUfrMJNUKLihGbpLGtaCOIR8VjQMGDePCgCCIiCNqzCAp2MyYUCXhUtF5E0D+g1t48qAd7CCLqQUQKEWkStcEfVGlLdp/fm3aW2QQdyLzf33zz5m2IsAZ9XhDpyaaIZkTS4ASzK41TFao88GuJ3hsr2pAbipHxuSYyKRugagICGANkfFnNh3HeE2N0b3nN2cgnpcictw5veJIzxmDamSlxxQZicq/mflxhbaH8BLRbuRwNtZp0JAhoplVRUdzmCe/vO27wFuuA3S5qXruGdboy5/PRGFsbFGKo/haRtQHIrM83bVeTrOgNhZReWaYGnE4aUQgTJNvijJFF4jQ8BxJE5xfKatZWmZcTQ+BVgh7s8SgPlCkcec4mGTmieTP4xd7PcpIEg1TX6gdeLW8rTVMVLVvb7ctXoH0Cydl2QOPJBG21STE5OsnbweVYzAnD3A7PVILuY0yiiyDwSm2g441r6rMSgp6iK42yqroI2QoXeJVeA+YeZSa47gZdXaZWQKTrG93rukk/l2Al6Kzh5AZEl7dDQy+JjgFahQjRopSxPbrbvK7GRe9ePWBo1wcU7sYrFZtavXALwGw/7Dnc50urrHJuTPSoO2IMV3gUQGNg87IbSOIY9BpiT9HV7FCZ94nPXb3MSnwHn/FFFE1vG6DTby+r31KAkUktB3Qf6ikUPWxW1BkXSPQeMHHiW0+HAd2GelJsZz1OJegCxqzl+CLVHa/IibuHeJ1HAKzhuDR+ymNaRFM+4jU6UWKXorRmbyqkq/D76FffevwdCp+jN3UAN/C9JRVTDuOxC/oh+EdMnqIOrlYteKSfadVRGLJFJPSB/ti/6K8f0CNymg/iH2gO/f0DwE0yjAFO6l8JaR5j0VPwPwfaYHqOqrCI319WzwhwzNW/aQAAAABJRU5ErkJggg==',
        className: 'import_icon'
      },
      {
        type: 'diamond',
        label: '条件判断',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAAHeEJUAAAAABGdBTUEAALGPC/xhBQAAAvVJREFUOBGNVEFrE0EU/mY3bQoiFlOkaUJrQUQoWMGePLX24EH0IIoHKQiCV0G8iE1covgLiqA/QTzVm1JPogc9tIJYFaQtlhQxqYjSpunu+L7JvmUTU3AgmTfvffPNN++9WSA1DO182f6xwILzD5btfAoQmwL5KJEwiQyVbSVZ0IgRyV6PTpIJ81E5ZvqfHQR0HUOBHW4L5Et2kQ6Zf7iAOhTFAA8s0pEP7AXO1uAA52SbqGk6h/6J45LaLhO64ByfcUzM39V7ZiAdS2yCePPEIQYvTUHqM/n7dgQNfBKWPjpF4ISk8q3J4nB11qw6X8l+FsF3EhlkEMfrjIer3wJTLwS2aCNcj4DbGxXTw00JmAuO+Ni6bBxVUCvS5d9aa04+so4pHW5jLTywuXAL7jJ+D06sl82Sgl2JuVBQn498zkc2bGKxULHjCnSMadBKYDYYHAtsby1EQ5lNGrQd4Y3v4Zo0XdGEmDno46yCM9Tk+RiJmUYHS/aXHPNTcjxcbTFna000PFJHIVZ5lFRqRpJWk9/+QtlOUYJj9HG5pVFEU7zqIYDVsw2s+AJaD8wTd2umgSCCyUxgGsS1Y6TBwXQQTFuZaHcd8gAGioE90hlsY+wMcs30RduYtxanjMGal8H5dMW67dmT1JFtYUEe8LiQLRsPZ6IIc7A4J5tqco3T0pnv/4u0kyzrYUq7gASuEyI8VXKvB9Odytv6jS/PNaZBln0nioJG/AVQRZvApOdhjj3Jt8QC8Im09SafwdBdvIpztpxWxpeKCC+EsFdS8DCyuCn2munFpL7ctHKp+Xc5cMybeIyMAN33SPL3ZR9QV1XVwLyzHm6Iv0/yeUuUb7PPlZC4D4HZkeu6dpF4v9j9MreGtMbxMMRLIcjJic9yHi7WQ3yVKzZVWUr5UrViJvn1FfUlwe/KYVfYyWRLSGNu16hR01U9IacajXPei0wx/5BqgInvJN+MMNtNme7ReU9SBbgntovn0kKHpFg7UogZvaZiOue/q1SBo9ktHzQAAAAASUVORK5CYII=',
      },
      {
        type: 'circle',
        text: '结束',
        label: '结束节点',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAAH6ji2bAAAABGdBTUEAALGPC/xhBQAAA1BJREFUOBFtVE1IVUEYPXOf+tq40Y3vPcmFIdSjIorWoRG0ERWUgnb5FwVhYQSl72oUoZAboxKNFtWiwKRN0M+jpfSzqJAQclHo001tKkjl3emc8V69igP3znzfnO/M9zcDcKT67azmjYWTwl9Vn7Vumeqzj1DVb6cleQY4oAVnIOPb+mKAGxQmKI5CWNJ2aLPatxWa3aB9K7/fB+/Z0jUF6TmMlFLQqrkECWQzOZxYGjTlOl8eeKaIY5yHnFn486xBustDjWT6dG7pmjHOJd+33t0iitTPkK6tEvjxq4h2MozQ6WFSX/LkDUGfFwfhEZj1Auz/U4pyAi5Sznd7uKzznXeVHlI/Aywmk6j7fsUsEuCGADrWARXXwjxWQsUbIupDHJI7kF5dRktg0eN81IbiZXiTESic50iwS+t1oJgL83jAiBupLDCQqwziaWSoAFSeIR3P5Xv5az00wyIn35QRYTwdSYbz8pH8fxUUAtxnFvYmEmgI0wYXUXcCCSpeEVpXlsRhBnCEATxWylL9+EKCAYhe1NGstUa6356kS9NVvt3DU2fd+Wtbm/+lSbylJqsqkSm9CRhvoJVlvKPvF1RKY/FcPn5j4UfIMLn8D4UYb54BNsilTDXKnF4CfTobA0FpoW/LSp306wkXM+XaOJhZaFkcNM82ASNAWMrhrUbRfmyeI1FvRBTpN06WKxa9BK0o2E4Pd3zfBBEwPsv9sQBnmLVbLEIZ/Xe9LYwJu/Er17W6HYVBc7vmuk0xUQ+pqxdom5Fnp55SiytXLPYoMXNM4u4SNSCFWnrVIzKG3EGyMXo6n/BQOe+bX3FClY4PwydVhthOZ9NnS+ntiLh0fxtlUJHAuGaFoVmttpVMeum0p3WEXbcll94l1wM/gZ0Ccczop77VvN2I7TlsZCsuXf1WHvWEhjO8DPtyOVg2/mvK9QqboEth+7pD6NUQC1HN/TwvydGBARi9MZSzLE4b8Ru3XhX2PBxf8E1er2A6516o0w4sIA+lwURhAON82Kwe2iDAC1Watq4XHaGQ7skLcFOtI5lDxuM2gZe6WFIotPAhbaeYlU4to5cuarF1QrcZ/lwrLaCJl66JBocYZnrNlvm2+MBCTmUymPrYZVbjdlr/BxlMjmNmNI3SAAAAAElFTkSuQmCC',
      }
    ])

    lf.render({
      "nodes": [
        {
          "id": "4a6978b7-b8a2-4c45-b2c6-c5dde956b858",
          "type": "circle",
          "x": 540,
          "y": 120,
          "properties": {
            "type": "upload"
          },
          "text": {
            "x": 540,
            "y": 120,
            "value": "开始"
          }
        },
        {
          "id": "75fd0b3f-60fe-4b39-8d7a-a3490815b7bd",
          "type": "rect",
          "x": 780,
          "y": 120,
          "properties": {
            "type": "dataFilter",
          },
          "text": {
            "x": 780,
            "y": 120,
            "value": "数据过滤"
          }
        }
      ],
      "edges": [
        {
          "id": "b1ebbcab-b169-4d89-8413-0191ef46a87e",
          "type": "polyline",
          "sourceNodeId": "4a6978b7-b8a2-4c45-b2c6-c5dde956b858",
          "targetNodeId": "75fd0b3f-60fe-4b39-8d7a-a3490815b7bd",
          "startPoint": {
            "x": 590,
            "y": 120
          },
          "endPoint": {
            "x": 730,
            "y": 120
          },
          "properties": {},
          "pointsList": [
            {
              "x": 590,
              "y": 120
            },
            {
              "x": 730,
              "y": 120
            }
          ]
        }
      ]
    })

    lf.on('node:dbclick', (data) => {
      console.log(data)
      this.config.title = data.data.text.value
      this.draw[data.data.properties.type] = true
      this.nowOption.id = data.data.id

      if (data.data.properties.type === 'dataFilter') {
        const edges = lf.getNodeIncomingEdge(data.data.id)
        for (let i = 0; i < edges.length; i++) {
          this.$set(this.xlsxData, data.data.id, Object.assign({}, this.xlsxData[edges[i].sourceNodeId][0]))
        }

        if ('filterRules' in data.data.properties) {
          this.nowOption.filterRules = data.data.properties.filterRules
        } else {
          this.nowOption.filterRules = []
        }
      }

      // 导出数据
      // console.log(lf.getGraphData())
    })

    this.lf = lf

  }
}

</script>

<style scoped>
.filter-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}
</style>
