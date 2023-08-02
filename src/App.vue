<template>
  <div id="app" style="position: fixed;left: 0;right: 0;top: 0;bottom: 0">
    <a-spin :spinning="isLoading" style="height: 100vh;width: 100vw">
<!--      <div id="container" style="position: fixed;left: 0;right: 0;top: 0;bottom: 0"></div>-->
      <div id="container" style="height: 100vh"></div>
    </a-spin>
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
            :rowKey="(record,index)=>{return index}"
            style="margin-top: 10px"
            :columns="xlsxData[nowOption.id].columns.filter((col,num)=>{if(col.show){return col}})"
            :data-source="xlsxData[nowOption.id].data"
            :pagination="xlsxData[nowOption.id].pagination"
            bordered
            @change="(pagination, filters, sorter)=>{xlsxData[nowOption.id].pagination = pagination}">
        </a-table>
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
                               @click="handleFilterRuleChange(rowIndex, 'column', item)">
                {{ item }}
              </a-select-option>
            </a-select>
            <a-select
                :default-value="rowItem.filterRule !== '' ? filterConfig.filterItem.find(obj => obj.value === rowItem.filterRule).desc : '请选择筛选规则'"
                style="width: 300px;margin: 0 10px">
              <a-select-option v-for="(item, index) in filterConfig.filterItem" :key="index" :value="index"
                               @click="handleFilterRuleChange(rowIndex, 'filterRule', item.value)">
                {{ item.desc }}
              </a-select-option>
            </a-select>
            <a-select
                v-if="rowIndex !== 0"
                :default-value="rowItem.type !== '' ? filterConfig.filterRelate.find(obj => obj.value === rowItem.type).desc : '请选择与或关系'"
                style="width: 300px;margin: 0 10px">
              <a-select-option v-for="(item, index) in filterConfig.filterRelate" :key="index" :value="index"
                               @click="handleFilterRuleChange(rowIndex, 'type', item.value)">
                {{ item.desc }}
              </a-select-option>
            </a-select>

            <a-input style="width: 300px" v-model="nowOption.filterRules[rowIndex].start" @input="notPreview"
                     placeholder="筛选内容"/>

            <a-button style="margin-left: 10px" @click="addFilterRule" v-if="rowIndex === 0">添加配置</a-button>
            <a-button style="margin-left: 10px" @click="removeFilterRule(rowIndex)" v-if="rowIndex !== 0">删除配置
            </a-button>
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
          <a-button @click="exportXlsx(xlsxData[nowOption.id].data, '导出结果')" style="margin-left: 10px">导出数据</a-button>
          <a-table
              :rowKey="(record,index)=>{return index}"
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
          <a-button @click="exportXlsx(filterData(nowOption.filterRules, xlsxData[nowOption.id].data), '导出结果')"
                    style="margin-left: 10px">导出数据
          </a-button>
          <a-table
              :rowKey="(record,index)=>{return index}"
              style="margin-top: 10px"
              :columns="xlsxData[nowOption.id].columns.filter((col,num)=>{if(col.show){return col}})"
              :data-source="filterData(nowOption.filterRules, xlsxData[nowOption.id].data)"
              :pagination="xlsxData[nowOption.id].pagination"
              bordered
              @change="(pagination, filters, sorter)=>{xlsxData[nowOption.id].pagination = pagination}">
          </a-table>
        </a-row>
      </div>
    </a-drawer>

    <a-drawer
        :title="config.title"
        placement="bottom"
        height="400"
        :closable="true"
        :visible="draw.deduplicate"
        @close="onClose"
        :zIndex="10"
        :destroyOnClose="true"
    >
      <p>数据去重配置</p>
      <div v-if="draw.deduplicate && nowOption.id in xlsxData">
        <div v-if="nowOption.deduplicateRules.length !== 0">
          <a-button @click="saveDeduplicateRules">保存配置</a-button>
          <a-button style="margin-left: 10px" v-show="!nowOption.preview" @click="nowOption.preview = true">预览
          </a-button>
          <a-button style="margin-left: 10px" v-show="nowOption.preview" @click="nowOption.preview = false">取消预览
          </a-button>
          <div class="filter-item" v-for="(rowItem, rowIndex) in nowOption.deduplicateRules">
            <a-select :default-value="rowItem !== '' ? rowItem : '请选择去重字段'" style="width: 300px">
              <a-select-option v-for="(item, index) in xlsxData[nowOption.id].columnList" :key="index" :value="item"
                               @click="handleDeduplicateRuleChange(rowIndex, item)">
                {{ item }}
              </a-select-option>
            </a-select>

            <a-button style="margin-left: 10px" @click="addDeduplicateRule" v-if="rowIndex === 0">添加配置</a-button>
            <a-button style="margin-left: 10px" @click="removeDeduplicateRule(rowIndex)" v-if="rowIndex !== 0">删除配置
            </a-button>
          </div>
        </div>
        <div v-if="nowOption.deduplicateRules.length === 0">
          <a-button @click="addDeduplicateRule">添加配置</a-button>
        </div>

        <a-row v-if="draw.deduplicate && nowOption.id in xlsxData">
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
          <a-button @click="exportXlsx(xlsxData[nowOption.id].data, '导出结果')" style="margin-left: 10px">导出数据</a-button>
          <a-table
              :rowKey="(record,index)=>{return index}"
              style="margin-top: 10px"
              :columns="xlsxData[nowOption.id].columns.filter((col,num)=>{if(col.show){return col}})"
              :data-source="xlsxData[nowOption.id].data"
              :pagination="xlsxData[nowOption.id].pagination"
              bordered
              @change="(pagination, filters, sorter)=>{xlsxData[nowOption.id].pagination = pagination}">
          </a-table>
        </a-row>

        <a-row v-if="draw.deduplicate && nowOption.id in xlsxData && nowOption.preview">
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
          <a-button
              @click="exportXlsx(deduplicateData(nowOption.deduplicateRules, xlsxData[nowOption.id].data), '导出结果')"
              style="margin-left: 10px">导出数据
          </a-button>
          <a-table
              :rowKey="(record,index)=>{return index}"
              style="margin-top: 10px"
              :columns="xlsxData[nowOption.id].columns.filter((col,num)=>{if(col.show){return col}})"
              :data-source="deduplicateData(nowOption.deduplicateRules, xlsxData[nowOption.id].data)"
              :pagination="xlsxData[nowOption.id].pagination"
              bordered
              @change="(pagination, filters, sorter)=>{xlsxData[nowOption.id].pagination = pagination}">
          </a-table>
        </a-row>
      </div>
    </a-drawer>

    <a-drawer
        :title="config.title"
        placement="bottom"
        height="400"
        :closable="true"
        :visible="draw.related"
        @close="onClose"
        :zIndex="10"
        :destroyOnClose="true"
    >
      <p>数据关联配置</p>
      <div v-if="draw.related">
        <div v-if="nowOption.relatedRules.length !== 0">
          <a-button @click="saveRelatedRules">保存配置</a-button>
          <a-button style="margin-left: 10px" v-show="!nowOption.preview" @click="previewRelated">预览
          </a-button>
          <a-button style="margin-left: 10px" v-show="nowOption.preview" @click="nowOption.preview = false">取消预览
          </a-button>
          <a-select
              :default-value="nowOption.saveTableId !== '' ? nowOption.tableNames[nowOption.tableIds.indexOf(nowOption.saveTableId)] : '请选择保留数据的表'"
              style="width: 300px;margin-left: 10px">
            <a-select-option v-for="(item, index) in nowOption.tableNames"
                             :key="index" :value="index"
                             @click="handleSaveTableChange(index)">
              {{ item }}
            </a-select-option>
          </a-select>
          <div class="filter-item">
            <span v-for="item in nowOption.tableNames" style="display: inline-block;width: 300px">{{ item }}</span>
            <span style="display: inline-block;width: 300px"></span>
          </div>
          <div class="filter-item" v-for="(rowItem, rowIndex) in nowOption.relatedRules">
            <a-select v-for="(selectItem, selectIndex) in nowOption.tableIds" :key="selectIndex"
                      :default-value="rowItem[selectItem] !== '' ? rowItem[selectItem] : '请选择关联字段'"
                      style="width: 300px;margin-left: 10px">
              <a-select-option v-for="(item, index) in xlsxData[selectItem].columnList"
                               :key="index" :value="item"
                               @click="handleRelatedChange(rowIndex, selectItem, item)">
                {{ item }}
              </a-select-option>
            </a-select>

            <a-select
                :default-value="rowItem.relatedRule !== '' ? relatedConfig.relatedItem.find(obj => obj.value === rowItem.relatedRule).desc : '请选择关联规则'"
                style="width: 300px;margin-left: 10px">
              <a-select-option v-for="(item, index) in relatedConfig.relatedItem" :key="index" :value="index"
                               @click="handleRelatedChange(rowIndex, 'relatedRule', item.value)">
                {{ item.desc }}
              </a-select-option>
            </a-select>

            <a-button style="margin-left: 10px" @click="addRelatedRule" v-if="rowIndex === 0">添加配置</a-button>
            <a-button style="margin-left: 10px" @click="removeRelatedRule(rowIndex)" v-if="rowIndex !== 0">删除配置
            </a-button>
          </div>
        </div>
        <div v-if="nowOption.relatedRules.length === 0">
          <a-button @click="addRelatedRule">添加配置</a-button>
        </div>

        <a-row v-if="draw.related && nowOption.preview">
          <p>关联后</p>
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
          <a-button
              @click="exportXlsx(relatedData(nowOption.relatedRules, xlsxData[nowOption.id].data, nowOption.saveTableId), '导出结果')"
              style="margin-left: 10px">导出数据
          </a-button>
          <a-table
              :rowKey="(record,index)=>{return index}"
              style="margin-top: 10px"
              :columns="xlsxData[nowOption.id].columns.filter((col,num)=>{if(col.show){return col}})"
              :data-source="relatedData(nowOption.relatedRules, xlsxData[nowOption.id].data, nowOption.saveTableId)"
              :pagination="xlsxData[nowOption.id].pagination"
              bordered
              @change="(pagination, filters, sorter)=>{xlsxData[nowOption.id].pagination = pagination}">
          </a-table>
        </a-row>
      </div>
    </a-drawer>

    <a-drawer
        :title="config.title"
        placement="bottom"
        height="400"
        :closable="true"
        :visible="draw.eliminate"
        @close="onClose"
        :zIndex="10"
        :destroyOnClose="true"
    >
      <p>数据剔除配置</p>
      <div v-if="draw.eliminate && nowOption.id in xlsxData">
        <div>
          <a-button @click="saveEliminateRule">保存配置</a-button>
          <a-button style="margin-left: 10px" v-show="!nowOption.preview" @click="nowOption.preview = true">预览
          </a-button>
          <a-button style="margin-left: 10px" v-show="nowOption.preview" @click="nowOption.preview = false">取消预览
          </a-button>
          <div class="filter-item">
            <a-select
                :default-value="nowOption.eliminateRule.column !== '' ? nowOption.eliminateRule.column : '请选择剔除数据所在字段'"
                style="width: 300px">
              <a-select-option v-for="(item, index) in xlsxData[nowOption.id].columnList" :key="index" :value="item"
                               @click="handleEliminateRuleChange(item)">
                {{ item }}
              </a-select-option>
            </a-select>
            <a-input v-model="nowOption.eliminateRule.rule" @input="notPreview" style="margin-left: 10px;width: 300px"
                     placeholder="剔除内容"/>
            <a-switch checked-children="开" un-checked-children="关" style="margin-left: 10px"
                      v-model="nowOption.eliminateRule.matchCase" @click="notPreview"/>
            匹配大小写
            <a-switch checked-children="开" un-checked-children="关" style="margin-left: 10px"
                      v-model="nowOption.eliminateRule.matchEntirety" @click="notPreview"/>
            全字匹配
          </div>
        </div>

        <a-row v-if="draw.eliminate && nowOption.id in xlsxData">
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
          <a-button @click="exportXlsx(xlsxData[nowOption.id].data, '导出结果')" style="margin-left: 10px">导出数据</a-button>
          <a-table
              :rowKey="(record,index)=>{return index}"
              style="margin-top: 10px"
              :columns="xlsxData[nowOption.id].columns.filter((col,num)=>{if(col.show){return col}})"
              :data-source="xlsxData[nowOption.id].data"
              :pagination="xlsxData[nowOption.id].pagination"
              bordered
              @change="(pagination, filters, sorter)=>{xlsxData[nowOption.id].pagination = pagination}">
          </a-table>
        </a-row>

        <a-row v-if="draw.eliminate && nowOption.id in xlsxData && nowOption.preview">
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
          <a-button
              @click="exportXlsx(eliminateData(nowOption.eliminateRule, xlsxData[nowOption.id].data), '导出结果')"
              style="margin-left: 10px">导出数据
          </a-button>
          <a-table
              :rowKey="(record,index)=>{return index}"
              style="margin-top: 10px"
              :columns="xlsxData[nowOption.id].columns.filter((col,num)=>{if(col.show){return col}})"
              :data-source="eliminateData(nowOption.eliminateRule, xlsxData[nowOption.id].data)"
              :pagination="xlsxData[nowOption.id].pagination"
              bordered
              @change="(pagination, filters, sorter)=>{xlsxData[nowOption.id].pagination = pagination}">
          </a-table>
        </a-row>
      </div>
    </a-drawer>

    <a-drawer
        :title="config.title"
        placement="bottom"
        height="400"
        :closable="true"
        :visible="draw.contentReplace"
        @close="onClose"
        :zIndex="10"
        :destroyOnClose="true"
    >
      <p>内容替换配置</p>
      <div v-if="draw.contentReplace && nowOption.id in xlsxData">
        <div>
          <a-button @click="saveContentReplaceRule">保存配置</a-button>
          <a-button style="margin-left: 10px" v-show="!nowOption.preview" @click="nowOption.preview = true">预览
          </a-button>
          <a-button style="margin-left: 10px" v-show="nowOption.preview" @click="nowOption.preview = false">取消预览
          </a-button>
          <div class="filter-item">
            <a-select
                :default-value="nowOption.contentReplaceRule.column !== '' ? nowOption.contentReplaceRule.column : '请选择内容替换字段'"
                style="width: 300px">
              <a-select-option v-for="(item, index) in xlsxData[nowOption.id].columnList" :key="index" :value="item"
                               @click="handleContentReplaceRuleChange(item)">
                {{ item }}
              </a-select-option>
            </a-select>
            <a-input v-model="nowOption.contentReplaceRule.findContent" @input="notPreview"
                     style="margin-left: 10px;width: 300px" placeholder="查找内容"/>
            <a-input v-model="nowOption.contentReplaceRule.replaceContent" @input="notPreview"
                     style="margin-left: 10px;width: 300px" placeholder="替换内容"/>
            <a-switch checked-children="开" un-checked-children="关" style="margin-left: 10px"
                      v-model="nowOption.contentReplaceRule.matchCase" @click="notPreview"/>
            匹配大小写
            <a-switch checked-children="开" un-checked-children="关" style="margin-left: 10px"
                      v-model="nowOption.contentReplaceRule.matchEntirety" @click="notPreview"/>
            全字匹配
            <!--            <a-switch checked-children="开" un-checked-children="关" style="margin-left: 10px"-->
            <!--                      v-model="nowOption.contentReplaceRule.isReplaceOrigin"/>-->
            <!--            是否在原字段上直接替换-->
            <!--            <a-input v-model="nowOption.contentReplaceRule.newColumn"-->
            <!--                     v-if="!nowOption.contentReplaceRule.isReplaceOrigin" @input="notPreview"-->
            <!--                     style="margin-left: 10px;width: 300px" placeholder="新字段名称"/>-->
          </div>
        </div>

        <a-row v-if="draw.contentReplace && nowOption.id in xlsxData">
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
          <a-button @click="exportXlsx(xlsxData[nowOption.id].data, '导出结果')" style="margin-left: 10px">导出数据</a-button>
          <a-table
              :rowKey="(record,index)=>{return index}"
              style="margin-top: 10px"
              :columns="xlsxData[nowOption.id].columns.filter((col,num)=>{if(col.show){return col}})"
              :data-source="xlsxData[nowOption.id].data"
              :pagination="xlsxData[nowOption.id].pagination"
              bordered
              @change="(pagination, filters, sorter)=>{xlsxData[nowOption.id].pagination = pagination}">
          </a-table>
        </a-row>

        <a-row v-if="draw.contentReplace && nowOption.id in xlsxData && nowOption.preview">
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
          <a-button
              @click="exportXlsx(contentReplaceData(nowOption.contentReplaceRule, xlsxData[nowOption.id].data), '导出结果')"
              style="margin-left: 10px">导出数据
          </a-button>
          <a-table
              :rowKey="(record,index)=>{return index}"
              style="margin-top: 10px"
              :columns="xlsxData[nowOption.id].columns.filter((col,num)=>{if(col.show){return col}})"
              :data-source="contentReplaceData(nowOption.contentReplaceRule, xlsxData[nowOption.id].data)"
              :pagination="xlsxData[nowOption.id].pagination"
              bordered
              @change="(pagination, filters, sorter)=>{xlsxData[nowOption.id].pagination = pagination}">
          </a-table>
        </a-row>
      </div>
    </a-drawer>

    <a-drawer
        :title="config.title"
        placement="bottom"
        height="400"
        :closable="true"
        :visible="draw.date"
        @close="onClose"
        :zIndex="10"
        :destroyOnClose="true"
    >
      <p>日期转换配置</p>
      <div v-if="draw.date && nowOption.id in xlsxData">
        <div v-if="nowOption.dateRules.length !== 0">
          <a-button @click="saveDateRules">保存配置</a-button>
          <a-button style="margin-left: 10px" v-show="!nowOption.preview" @click="nowOption.preview = true">预览
          </a-button>
          <a-button style="margin-left: 10px" v-show="nowOption.preview" @click="nowOption.preview = false">取消预览
          </a-button>
          <div class="filter-item" v-for="(rowItem, rowIndex) in nowOption.dateRules">
            <a-select :default-value="rowItem.column !== '' ? rowItem.column : '请选择转换字段'" style="width: 300px">
              <a-select-option v-for="(item, index) in xlsxData[nowOption.id].columnList" :key="index" :value="item"
                               @click="handleDateRuleChange(rowIndex, 'column', item)">
                {{ item }}
              </a-select-option>
            </a-select>
            <!--            <a-select-->
            <!--                :default-value="rowItem.originDateRule !== '' ? dateConfig.dateItem.find(obj => obj.value === rowItem.originDateRule).desc : '请选择原格式'"-->
            <!--                style="width: 300px;margin-left: 10px">-->
            <!--              <a-select-option v-for="(item, index) in dateConfig.dateItem" :key="index" :value="index"-->
            <!--                               @click="handleDateRuleChange(rowIndex, 'originDateRule', item.value)">-->
            <!--                {{ item.desc }}-->
            <!--              </a-select-option>-->
            <!--            </a-select>-->
            <a-select
                :default-value="rowItem.newDateRule !== '' ? dateConfig.dateItem.find(obj => obj.value === rowItem.newDateRule).desc : '请选择转换后格式'"
                style="width: 300px;margin-left: 10px">
              <a-select-option v-for="(item, index) in dateConfig.dateItem" :key="index" :value="index"
                               @click="handleDateRuleChange(rowIndex, 'newDateRule', item.value)">
                {{ item.desc }}
              </a-select-option>
            </a-select>

            <a-button style="margin-left: 10px" @click="addDateRule" v-if="rowIndex === 0">添加配置</a-button>
            <a-button style="margin-left: 10px" @click="removeDateRule(rowIndex)" v-if="rowIndex !== 0">删除配置
            </a-button>
          </div>
        </div>
        <div v-if="nowOption.dateRules.length === 0">
          <a-button @click="addDateRule">添加配置</a-button>
        </div>

        <a-row v-if="draw.date && nowOption.id in xlsxData">
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
          <a-button @click="exportXlsx(xlsxData[nowOption.id].data, '导出结果')" style="margin-left: 10px">导出数据</a-button>
          <a-table
              :rowKey="(record,index)=>{return index}"
              style="margin-top: 10px"
              :columns="xlsxData[nowOption.id].columns.filter((col,num)=>{if(col.show){return col}})"
              :data-source="xlsxData[nowOption.id].data"
              :pagination="xlsxData[nowOption.id].pagination"
              bordered
              @change="(pagination, filters, sorter)=>{xlsxData[nowOption.id].pagination = pagination}">
          </a-table>
        </a-row>

        <a-row v-if="draw.date && nowOption.id in xlsxData && nowOption.preview">
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
          <a-button
              @click="exportXlsx(dateData(nowOption.dateRules, xlsxData[nowOption.id].data), '导出结果')"
              style="margin-left: 10px">导出数据
          </a-button>
          <a-table
              :rowKey="(record,index)=>{return index}"
              style="margin-top: 10px"
              :columns="xlsxData[nowOption.id].columns.filter((col,num)=>{if(col.show){return col}})"
              :data-source="dateData(nowOption.dateRules, xlsxData[nowOption.id].data)"
              :pagination="xlsxData[nowOption.id].pagination"
              bordered
              @change="(pagination, filters, sorter)=>{xlsxData[nowOption.id].pagination = pagination}">
          </a-table>
        </a-row>
      </div>
    </a-drawer>

    <a-drawer
        :title="config.title"
        placement="bottom"
        height="400"
        :closable="true"
        :visible="draw.timeCompare"
        @close="onClose"
        :zIndex="10"
        :destroyOnClose="true"
    >
      <p>时间比较配置</p>
      <div v-if="draw.timeCompare && nowOption.id in xlsxData">
        <div v-if="nowOption.timeCompareRules.length !== 0">
          <a-button @click="saveTimeCompareRules">保存配置</a-button>
          <a-button style="margin-left: 10px" v-show="!nowOption.preview" @click="nowOption.preview = true">预览
          </a-button>
          <a-button style="margin-left: 10px" v-show="nowOption.preview" @click="nowOption.preview = false">取消预览
          </a-button>
          <div class="filter-item" v-for="(rowItem, rowIndex) in nowOption.timeCompareRules">
            <a-select :default-value="rowItem.leftColumn !== '' ? rowItem.leftColumn : '请选择时间比较字段'"
                      style="width: 300px">
              <a-select-option v-for="(item, index) in xlsxData[nowOption.id].columnList" :key="index" :value="item"
                               @click="handleTimeCompareRuleChange(rowIndex, 'leftColumn', item)">
                {{ item }}
              </a-select-option>
            </a-select>
            <a-select
                :default-value="rowItem.rule !== '' ? timeCompareConfig.timeCompareItem.find(obj => obj.value === rowItem.rule).desc : '请选择时间比较规则'"
                style="width: 300px;margin-left: 10px">
              <a-select-option v-for="(item, index) in timeCompareConfig.timeCompareItem" :key="index" :value="index"
                               @click="handleTimeCompareRuleChange(rowIndex, 'rule', item.value)">
                {{ item.desc }}
              </a-select-option>
            </a-select>
            <a-select :default-value="rowItem.rightColumn !== '' ? rowItem.rightColumn : '请选择时间比较字段'"
                      style="width: 300px;margin-left: 10px">
              <a-select-option v-for="(item, index) in xlsxData[nowOption.id].columnList" :key="index" :value="item"
                               @click="handleTimeCompareRuleChange(rowIndex, 'rightColumn', item)">
                {{ item }}
              </a-select-option>
            </a-select>
            <a-select
                v-if="rowIndex !== 0"
                :default-value="rowItem.type !== '' ? timeCompareConfig.timeCompareRelate.find(obj => obj.value === rowItem.type).desc : '请选择与或关系'"
                style="width: 300px;margin: 0 10px">
              <a-select-option v-for="(item, index) in timeCompareConfig.timeCompareRelate" :key="index" :value="index"
                               @click="handleTimeCompareRuleChange(rowIndex, 'type', item.value)">
                {{ item.desc }}
              </a-select-option>
            </a-select>

            <a-button style="margin-left: 10px" @click="addTimeCompareRule" v-if="rowIndex === 0">添加配置</a-button>
            <a-button style="margin-left: 10px" @click="removeTimeCompareRule(rowIndex)" v-if="rowIndex !== 0">删除配置
            </a-button>
          </div>
        </div>
        <div v-if="nowOption.timeCompareRules.length === 0">
          <a-button @click="addTimeCompareRule">添加配置</a-button>
        </div>

        <a-row v-if="draw.timeCompare && nowOption.id in xlsxData">
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
          <a-button @click="exportXlsx(xlsxData[nowOption.id].data, '导出结果')" style="margin-left: 10px">导出数据</a-button>
          <a-table
              :rowKey="(record,index)=>{return index}"
              style="margin-top: 10px"
              :columns="xlsxData[nowOption.id].columns.filter((col,num)=>{if(col.show){return col}})"
              :data-source="xlsxData[nowOption.id].data"
              :pagination="xlsxData[nowOption.id].pagination"
              bordered
              @change="(pagination, filters, sorter)=>{xlsxData[nowOption.id].pagination = pagination}">
          </a-table>
        </a-row>

        <a-row v-if="draw.timeCompare && nowOption.id in xlsxData && nowOption.preview">
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
          <a-button
              @click="exportXlsx(timeCompareData(nowOption.timeCompareRules, xlsxData[nowOption.id].data), '导出结果')"
              style="margin-left: 10px">导出数据
          </a-button>
          <a-table
              :rowKey="(record,index)=>{return index}"
              style="margin-top: 10px"
              :columns="xlsxData[nowOption.id].columns.filter((col,num)=>{if(col.show){return col}})"
              :data-source="timeCompareData(nowOption.timeCompareRules, xlsxData[nowOption.id].data)"
              :pagination="xlsxData[nowOption.id].pagination"
              bordered
              @change="(pagination, filters, sorter)=>{xlsxData[nowOption.id].pagination = pagination}">
          </a-table>
        </a-row>
      </div>
    </a-drawer>

    <a-drawer
        :title="config.title"
        placement="bottom"
        height="400"
        :closable="true"
        :visible="draw.nullFill"
        @close="onClose"
        :zIndex="10"
        :destroyOnClose="true"
    >
      <p>空值填充配置</p>
      <div v-if="draw.nullFill && nowOption.id in xlsxData">
        <div v-if="nowOption.nullFillRules.length !== 0">
          <a-button @click="saveNullFillRules">保存配置</a-button>
          <a-button style="margin-left: 10px" v-show="!nowOption.preview" @click="nowOption.preview = true">预览
          </a-button>
          <a-button style="margin-left: 10px" v-show="nowOption.preview" @click="nowOption.preview = false">取消预览
          </a-button>
          <div class="filter-item" v-for="(rowItem, rowIndex) in nowOption.nullFillRules">
            <a-select :default-value="rowItem.column !== '' ? rowItem.column : '请选择需要填充的字段'" style="width: 300px">
              <a-select-option v-for="(item, index) in xlsxData[nowOption.id].columnList" :key="index" :value="item"
                               @click="handleNullFillRuleChange(rowIndex, 'column', item)">
                {{ item }}
              </a-select-option>
            </a-select>
            <a-select mode="tags" :default-value="rowItem.conditions !== [] ? rowItem.conditions : '请选择空值条件'"
                      style="width: 300px;margin-left: 10px" @change="handleNullFillConditionsChange($event, rowIndex)">
              <a-select-option v-for="(item, index) in nullFillConfig.judgmentBasis" :key="index" :value="item.value">
                {{ item.desc }}
              </a-select-option>
            </a-select>
            <a-input v-if="rowItem.conditions.indexOf('custom') !== -1" v-model="rowItem.custom"
                     @input="notPreview"
                     style="width: 300px; margin-left: 10px" placeholder="请输入要填充的值"/>
            <a-select
                :default-value="rowItem.rule !== '' ? rowItem.rule : '请选择填充规则'"
                style="width: 300px;margin: 0 10px">
              <a-select-option v-for="(item, index) in nullFillConfig.nullFillItem" :key="index" :value="index"
                               @click="handleNullFillRuleChange(rowIndex, 'rule', item)">
                {{ item }}
              </a-select-option>
            </a-select>
            <a-input v-if="rowItem.rule === '统一填充'" v-model="rowItem.fillValue" @input="notPreview"
                     style="width: 300px; margin-right: 10px" placeholder="请输入统一填充的值"/>

            <a-button style="margin-left: 10px" @click="addNullFillRule" v-if="rowIndex === 0">添加配置</a-button>
            <a-button style="margin-left: 10px" @click="removeNullFillRule(rowIndex)" v-if="rowIndex !== 0">删除配置
            </a-button>
          </div>
        </div>
        <div v-if="nowOption.nullFillRules.length === 0">
          <a-button @click="addNullFillRule">添加配置</a-button>
        </div>

        <a-row v-if="draw.nullFill && nowOption.id in xlsxData">
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
          <a-button @click="exportXlsx(xlsxData[nowOption.id].data, '导出结果')" style="margin-left: 10px">导出数据</a-button>
          <a-table
              :rowKey="(record,index)=>{return index}"
              style="margin-top: 10px"
              :columns="xlsxData[nowOption.id].columns.filter((col,num)=>{if(col.show){return col}})"
              :data-source="xlsxData[nowOption.id].data"
              :pagination="xlsxData[nowOption.id].pagination"
              bordered
              @change="(pagination, filters, sorter)=>{xlsxData[nowOption.id].pagination = pagination}">
          </a-table>
        </a-row>

        <a-row v-if="draw.nullFill && nowOption.id in xlsxData && nowOption.preview">
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
          <a-button
              @click="exportXlsx(nullFillData(nowOption.nullFillRules, xlsxData[nowOption.id].data), '导出结果')"
              style="margin-left: 10px">导出数据
          </a-button>
          <a-table
              :rowKey="(record,index)=>{return index}"
              style="margin-top: 10px"
              :columns="xlsxData[nowOption.id].columns.filter((col,num)=>{if(col.show){return col}})"
              :data-source="nullFillData(nowOption.nullFillRules, xlsxData[nowOption.id].data)"
              :pagination="xlsxData[nowOption.id].pagination"
              bordered
              @change="(pagination, filters, sorter)=>{xlsxData[nowOption.id].pagination = pagination}">
          </a-table>
        </a-row>
      </div>
    </a-drawer>

    <a-drawer
        :title="config.title"
        placement="bottom"
        height="400"
        :closable="true"
        :visible="draw.finish"
        @close="onClose"
        :zIndex="10"
        :destroyOnClose="true"
    >
      <p>流程结束数据</p>
      <a-row v-if="draw.finish && nowOption.id in xlsxData">
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
        <a-button @click="exportXlsx(xlsxData[nowOption.id].data, '导出结果')" style="margin-left: 10px">导出数据</a-button>
        <a-table
            :rowKey="(record,index)=>{return index}"
            style="margin-top: 10px"
            :columns="xlsxData[nowOption.id].columns.filter((col,num)=>{if(col.show){return col}})"
            :data-source="xlsxData[nowOption.id].data"
            :pagination="xlsxData[nowOption.id].pagination"
            bordered
            @change="(pagination, filters, sorter)=>{xlsxData[nowOption.id].pagination = pagination}">
        </a-table>
      </a-row>
    </a-drawer>

  </div>
</template>

<script>
import "@logicflow/core/dist/style/index.css"
import '@logicflow/extension/lib/style/index.css'
import {read, utils, writeFile} from "xlsx";
import {
  addDateRule,
  addDeduplicateRule,
  addFilterRule, addNullFillRule,
  addRelatedRule, addTimeCompareRule,
  beforeUpload,
  contentReplaceData,
  dateData,
  deduplicateData,
  eliminateData, exportXlsx,
  filterData,
  handleContentReplaceRuleChange,
  handleDateRuleChange,
  handleDeduplicateRuleChange,
  handleEliminateRuleChange,
  handleFilterRuleChange, handleNullFillConditionsChange, handleNullFillRuleChange,
  handleRelatedChange,
  handleSaveTableChange,
  handleTimeCompareRuleChange, nullFillData,
  previewRelated,
  relatedData,
  removeDateRule,
  removeDeduplicateRule,
  removeFilterRule, removeNullFillRule,
  removeRelatedRule, removeTimeCompareRule,
  saveContentReplaceRule,
  saveDateRules,
  saveDeduplicateRules,
  saveEliminateRule,
  saveFilterRules, saveNullFillRules,
  saveRelatedRules,
  saveTimeCompareRules, saveUploadColumnList,
  setContentReplaceType,
  setDataFilterType,
  setDateType,
  setDeduplicateType,
  setEliminateType,
  setFinishType,
  setNullFillType,
  setRelatedType,
  setTimeCompareType,
  setUploadType,
  timeCompareData
} from "@/utils/execute";
import {initLogicFlow} from "@/utils/LogicFlowConfig";

export default {
  name: "App",
  data() {
    return {
      visible: false,
      config: {
        title: ''
      },
      isLoading: false,
      draw: {
        upload: false,
        dataFilter: false,
        deduplicate: false,
        related: false,
        eliminate: false,
        contentReplace: false,
        date: false,
        timeCompare: false,
        nullFill: false,
        finish: false,
      },
      nowOption: {
        id: 0,
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
        ],
        filterRelate: [
          {
            desc: '与',
            value: ' && '
          },
          {
            desc: '或',
            value: ' || '
          }
        ]
      },
      relatedConfig: {
        relatedItem: [
          {
            desc: '等于',
            value: ' == '
          },
          {
            desc: '不等于',
            value: ' != '
          }
        ]
      },
      dateConfig: {
        dateItem: [
          {
            desc: '2023-12-13',
            value: 'YYYY-MM-DD'
          },
          {
            desc: '2023年12月13日',
            value: 'YYYY年MM月DD日'
          },
          {
            desc: '2023/12/13',
            value: 'YYYY/MM/DD'
          },
          {
            desc: '2023/12/13 12:12:12',
            value: 'YYYY/MM/DD HH:mm:ss'
          },
          {
            desc: '2023-12-13 12:12:12',
            value: 'YYYY-MM-DD HH:mm:ss'
          },
          {
            desc: '2023年12月13日 12:12:12',
            value: 'YYYY年MM月DD日 HH:mm:ss'
          },
        ]
      },
      timeCompareConfig: {
        timeCompareItem: [
          {
            desc: '等于',
            value: 'isSame'
          },
          {
            desc: '不等于',
            value: '!='
          },
          {
            desc: '大于',
            value: 'isAfter'
          },
          {
            desc: '小于',
            value: 'isBefore'
          },
          {
            desc: '大于等于',
            value: 'isSameOrAfter'
          },
          {
            desc: '小于等于',
            value: 'isSameOrBefore'
          },
        ],
        timeCompareRelate: [
          {
            desc: '与',
            value: ' && '
          },
          {
            desc: '或',
            value: ' || '
          }
        ]
      },
      nullFillConfig: {
        judgmentBasis: [
          {
            desc: 'NULL值',
            value: 'null'
          },
          {
            desc: '字符串长度 < 1',
            value: 'length'
          },
          {
            desc: '值为NULL字符(不区分大小写)',
            value: 'nullCase'
          },
          {
            desc: '自定义字符',
            value: 'custom'
          },
        ],
        nullFillItem: [
          '统一填充',
          '均值填充',
          '众值填充',
        ]
      },
      typeFunction: {
        upload: setUploadType,
        dataFilter: setDataFilterType,
        deduplicate: setDeduplicateType,
        related: setRelatedType,
        finish: setFinishType,
        eliminate: setEliminateType,
        contentReplace: setContentReplaceType,
        date: setDateType,
        timeCompare: setTimeCompareType,
        nullFill: setNullFillType,
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
      await beforeUpload(this, file)
    },
    handleFilterRuleChange(rowIndex, property, value) {
      handleFilterRuleChange(this, rowIndex, property, value)
    },
    addFilterRule() {
      addFilterRule(this)
    },
    removeFilterRule(index) {
      removeFilterRule(this, index)
    },
    saveFilterRules() {
      saveFilterRules(this)
    },
    filterData(filterRules, dataList) {
      return filterData(filterRules, dataList)
    },
    handleDeduplicateRuleChange(index, item) {
      handleDeduplicateRuleChange(this, index, item)
    },
    addDeduplicateRule() {
      addDeduplicateRule(this)
    },
    removeDeduplicateRule(index) {
      removeDeduplicateRule(this, index)
    },
    saveDeduplicateRules() {
      saveDeduplicateRules(this)
    },
    deduplicateData(deduplicateRules, dataList) {
      return deduplicateData(deduplicateRules, dataList)
    },
    addRelatedRule() {
      addRelatedRule(this)
    },
    saveRelatedRules() {
      saveRelatedRules(this)
    },
    handleRelatedChange(rowIndex, type, item) {
      handleRelatedChange(this, rowIndex, type, item)
    },
    removeRelatedRule(index) {
      removeRelatedRule(this, index)
    },
    relatedData(relatedRule, dataList, saveTableId) {
      return relatedData(this, relatedRule, dataList, saveTableId)
    },
    handleSaveTableChange(index) {
      handleSaveTableChange(this, index)
    },
    previewRelated() {
      previewRelated(this)
    },
    handleEliminateRuleChange(item) {
      handleEliminateRuleChange(this, item)
    },
    saveEliminateRule() {
      saveEliminateRule(this)
    },
    eliminateData(eliminateRule, dataList) {
      return eliminateData(eliminateRule, dataList)
    },
    handleContentReplaceRuleChange(item) {
      handleContentReplaceRuleChange(this, item)
    },
    saveContentReplaceRule() {
      saveContentReplaceRule(this)
    },
    contentReplaceData(contentReplaceRule, dataList) {
      return contentReplaceData(contentReplaceRule, dataList)
    },
    handleDateRuleChange(rowIndex, type, item) {
      handleDateRuleChange(this, rowIndex, type, item)
    },
    saveDateRules() {
      saveDateRules(this)
    },
    dateData(dateRules, dataList) {
      return dateData(dateRules, dataList)
    },
    addDateRule() {
      addDateRule(this)
    },
    removeDateRule(rowIndex) {
      removeDateRule(this, rowIndex)
    },
    saveTimeCompareRules() {
      saveTimeCompareRules(this)
    },
    timeCompareData(timeCompareRules, dataList) {
      return timeCompareData(timeCompareRules, dataList)
    },
    handleTimeCompareRuleChange(rowIndex, type, item) {
      handleTimeCompareRuleChange(this, rowIndex, type, item)
    },
    addTimeCompareRule() {
      addTimeCompareRule(this)
    },
    removeTimeCompareRule(rowIndex) {
      removeTimeCompareRule(this, rowIndex)
    },
    saveNullFillRules() {
      saveNullFillRules(this)
    },
    handleNullFillRuleChange(rowIndex, type, item) {
      handleNullFillRuleChange(this, rowIndex, type, item)
    },
    addNullFillRule() {
      addNullFillRule(this)
    },
    removeNullFillRule(rowIndex) {
      removeNullFillRule(this, rowIndex)
    },
    nullFillData(nullFillRules, dataList) {
      return nullFillData(nullFillRules, dataList)
    },
    handleNullFillConditionsChange(value, rowIndex) {
      handleNullFillConditionsChange(this, value, rowIndex)
    },
    notPreview() {
      this.nowOption.preview = false
    },
    exportXlsx(data, filename) {
      exportXlsx(data, filename)
    },
  },
  mounted() {
    initLogicFlow(this)
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
