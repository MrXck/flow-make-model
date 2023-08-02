import {read, utils, writeFile} from "xlsx";


export function notPreview(_this) {
    _this.nowOption.preview = false
}

export function saveXlsxData(_this, nodeId, dataList) {
    _this.$set(_this.xlsxData[nodeId], 'data', dataList)
}

export function executeBefore(_this, lf, nodeId, xlsxData) {
    if (nodeId in xlsxData) {
        return
    }

    let inComingNodes = lf.getNodeIncomingNode(nodeId)
    if (inComingNodes.length === 0 && lf.getNodeDataById(nodeId).properties.type !== 'upload') {
        _this.$message.error('请正确配置流程')
        throw new Error('请正确配置流程.')
    }
    if (inComingNodes.length === 0) {
        return
    }

    for (let i = 0; i < inComingNodes.length; i++) {
        if (!(inComingNodes[i].id in xlsxData)) {
            executeBefore(_this, lf, inComingNodes[i].id, xlsxData)
        }
    }

    const properties = lf.getNodeDataById(nodeId).properties
    if (inComingNodes.length === 1) {
        let resultData = []
        if (properties.type === 'dataFilter') {
            resultData = filterData(properties.filterRules, xlsxData[inComingNodes[0].id].data)
        } else if (properties.type === 'deduplicate') {
            resultData = deduplicateData(properties.deduplicateRules, xlsxData[inComingNodes[0].id].data)
        } else if (properties.type === 'eliminate') {
            resultData = eliminateData(properties.eliminateRule, xlsxData[inComingNodes[0].id].data)
        } else if (properties.type === 'contentReplace') {
            resultData = contentReplaceData(properties.contentReplaceRule, xlsxData[inComingNodes[0].id].data)
        } else if (properties.type === 'date') {
            resultData = dateData(properties.dateRules, xlsxData[inComingNodes[0].id].data)
        } else if (properties.type === 'timeCompare') {
            resultData = timeCompareData(properties.timeCompareRules, xlsxData[inComingNodes[0].id].data)
        } else if (properties.type === 'nullFill') {
            resultData = nullFillData(properties.nullFillRules, xlsxData[inComingNodes[0].id].data)
        }

        const data = Object.assign({}, _this.xlsxData[inComingNodes[0].id])
        data.data = resultData
        _this.$set(_this.xlsxData, nodeId, data)
    } else if (inComingNodes.length > 1) {
        let resultData = []
        if (properties.type === 'related') {
            const data = Object.assign({}, _this.xlsxData[properties.saveTableId])
            resultData = relatedData(_this, properties.relatedRules, data.data, properties.saveTableId)
            data.data = resultData
            _this.$set(_this.xlsxData, nodeId, data)
            console.log('关联数据', nodeId, inComingNodes.map(data => data.id))
            console.log(_this.xlsxData[nodeId])
        }
    }
}

export function executeFlow(_this, lf, nodeId, xlsxData) {
    let inComing = lf.getNodeIncomingNode(nodeId)
    let nodeData = lf.getNodeDataById(nodeId)
    if (nodeData.properties.type === 'finish' && inComing.length > 1) {
        _this.$message.error('结束节点前不能被一个节点以上连接')
        throw new Error('结束节点前不能被一个节点以上连接.')
    }

    if (nodeData.properties.type !== 'upload' && lf.getNodeIncomingNode(nodeId).length === 0) {
        _this.$message.error('请正确配置流程')
        throw new Error('请正确配置流程.')
    }

    executeBefore(_this, lf, nodeId, xlsxData)
    _this.$set(_this.xlsxData, nodeId, Object.assign({}, _this.xlsxData[inComing[0].id]))
}

export function exportXlsx(data, filename) {
    const ws = utils.json_to_sheet(data, {sheetStubs: true})
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Sheet1')
    writeFile(wb, `${filename}.xlsx`)
}

export function execute(_this, lf) {
    const uploadNodeIds = []
    const endNodeIds = lf.getGraphData().nodes.filter((data, index, arr) => {
        if (data.properties.type !== 'upload') {
            delete _this.xlsxData[data.id]
        } else {
            uploadNodeIds.push(data.id)
        }
        return lf.getNodeOutgoingNode(data.id).length === 0 && lf.getNodeIncomingNode(data.id) !== 0
    }).map(data => {
        return data.id
    })

    for (let i = 0; i < uploadNodeIds.length; i++) {
        if (!(uploadNodeIds[i] in _this.xlsxData)) {
            // _this.$message.error('请在每个开始节点都上传了数据后再执行流程')
            // return
            throw new Error('请在每个开始节点都上传了数据后再执行流程')
        }
    }

    if (endNodeIds.length > 1) {
        // _this.$message.error('最多只能同时存在一个最终节点')
        // return
        throw new Error('最多只能同时存在一个最终节点')
    } else if (endNodeIds.length < 1) {
        // _this.$message.error('最少要有一个最终节点')
        throw new Error('最少要有一个最终节点')
        // return
    }
    for (let i = 0; i < endNodeIds.length; i++) {
        executeFlow(_this, lf, endNodeIds[i], _this.xlsxData)
    }
    return uploadNodeIds
}

export function saveUploadColumnList(_this, nodeId, columnList) {
    const properties = _this.lf.getProperties(nodeId)
    properties.columnList = columnList
    _this.lf.setProperties(nodeId, properties)
}





export function nullFillData(nullFillRules, dataList) {
    let list = [...dataList]

    if (nullFillRules.length > 0) {
        try {
            for (let i = 0; i < nullFillRules.length; i++) {
                let evalString = ''

                for (let j = 0; j < nullFillRules[i].conditions.length; j++) {
                    let rule = nullFillRules[i].conditions[j]
                    if (j !== 0) {
                        evalString += ` || data['${nullFillRules[i].column}']`
                    } else {
                        evalString += `data['${nullFillRules[i].column}']`
                    }
                    if (rule === 'null') {
                        evalString += ` === null`
                    } else if (rule === 'length') {
                        evalString += `.length === 0`
                    } else if (rule === 'nullCase') {
                        evalString += `.toString().toLowerCase() === 'null'`
                    } else if (rule === 'custom') {
                        evalString += `.toString() === '${nullFillRules[i].custom}'`
                    }
                }

                if (nullFillRules[i].rule === '统一填充') {
                    evalString += ` ? data['${nullFillRules[i].column}'] = '${nullFillRules[i].fillValue}' : true`
                } else if (nullFillRules[i].rule === '均值填充') {
                    let total = 0
                    let flag = false
                    for (let j = 0; j < list.length; j++) {
                        if (list[j][nullFillRules[i].column] instanceof Number) {
                            total += list[j][nullFillRules[i].column]
                        } else {
                            flag = true
                            break
                        }
                    }
                    if (flag) {
                        evalString += ` ? true : true`
                    } else {
                        let avg = total / list.length
                        evalString += ` ? data['${nullFillRules[i].column}'] = ${avg} : true`
                    }
                } else if (nullFillRules[i].rule === '众值填充') {
                    let obj = {}

                    list.map(data => {
                        if (data[nullFillRules[i].column] in obj) {
                            obj[data[nullFillRules[i].column]] += 1
                        } else {
                            obj[data[nullFillRules[i].column]] = 1
                        }
                    })

                    let keys = Object.keys(obj);
                    let sortKeys = keys.sort(function (a, b) {
                        return obj[b] - obj[a];
                    })

                    evalString += ` ? data['${nullFillRules[i].column}'] = '${sortKeys[0]}' : true`

                }

                list = list.map(result => {
                    let data = Object.assign({}, result)
                    eval(evalString)
                    return data
                })
            }
        } catch (e) {
            throw new Error('空值填充失败 请检查相关配置项')
        }

    }

    return list
}

export function saveNullFillRules(_this) {
    for (let i = 0; i < _this.nowOption.nullFillRules.length; i++) {
        let {column, conditions, rule} = _this.nowOption.nullFillRules[i]
        if (column === '') {
            _this.$message.error('空值字段不能为空')
            return
        }
        if (rule === '') {
            _this.$message.error('填充规则不能为空')
            return
        }
        if (conditions.length === 0) {
            _this.$message.error('空值条件不能为空')
            return
        }
    }

    const properties = _this.lf.getProperties(_this.nowOption.id)
    properties.nullFillRules = _this.nowOption.nullFillRules
    _this.lf.setProperties(_this.nowOption.id, properties)
    saveXlsxData(_this, _this.nowOption.id, nullFillData(_this.nowOption.nullFillRules, _this.xlsxData[_this.nowOption.id].data))
}

export function handleNullFillRuleChange(_this, rowIndex, type, item) {
    notPreview(_this)
    _this.nowOption.nullFillRules[rowIndex][type] = item
}

export function addNullFillRule(_this) {
    notPreview(_this)
    _this.nowOption.nullFillRules.push({
        column: '',
        conditions: [],
        custom: '',
        rule: '',
        fillValue: ''
    })
}

export function removeNullFillRule(_this, rowIndex) {
    notPreview(_this)
    _this.nowOption.nullFillRules.splice(rowIndex, 1)
}

export function handleNullFillConditionsChange(_this, value, rowIndex) {
    notPreview(_this)
    _this.nowOption.nullFillRules[rowIndex].conditions = value
}





export function timeCompareData(timeCompareRules, dataList) {
    let list = [...dataList]
    if (timeCompareRules.length > 0) {
        try {
            let evalString = ''
            for (let i = 0; i < timeCompareRules.length; i++) {
                if (i !== 0) {
                    evalString += `${timeCompareRules[i].type}`
                }
                if (timeCompareRules[i].rule === '!=') {
                    evalString += `!(dayjs(data['${timeCompareRules[i].leftColumn}']).isSame(dayjs(data['${timeCompareRules[i].rightColumn}'])))`
                } else {
                    evalString += `dayjs(data['${timeCompareRules[i].leftColumn}']).${timeCompareRules[i].rule}(dayjs(data['${timeCompareRules[i].rightColumn}']))`
                }
            }
            list = list.filter((data, index, arr) => {
                return eval(evalString)
            })
        } catch (e) {
            throw new Error('时间比较失败 请检查相关配置项')
        }
    }
    return list
}

export function saveTimeCompareRules(_this) {
    for (let i = 0; i < _this.nowOption.timeCompareRules.length; i++) {
        let {leftColumn, rightColumn, rule, type} = _this.nowOption.timeCompareRules[i]

        if (leftColumn === '' || rightColumn === '') {
            _this.$message.error('时间比较字段不能为空')
            return
        }

        if (rule === '') {
            _this.$message.error('时间比较规则不能为空')
            return
        }

        if (type === '') {
            _this.$message.error('与或关系不能为空')
            return
        }
    }
    const properties = _this.lf.getProperties(_this.nowOption.id)
    properties.timeCompareRules = _this.nowOption.timeCompareRules
    _this.lf.setProperties(_this.nowOption.id, properties)
    saveXlsxData(_this, _this.nowOption.id, timeCompareData(_this.nowOption.timeCompareRules, _this.xlsxData[_this.nowOption.id].data))
}

export function handleTimeCompareRuleChange(_this, rowIndex, type, item) {
    notPreview(_this)
    _this.nowOption.timeCompareRules[rowIndex][type] = item
}

export function addTimeCompareRule(_this) {
    notPreview(_this)
    _this.nowOption.timeCompareRules.push({
        leftColumn: '',
        rule: '',
        rightColumn: '',
        type: ' && '
    })
}

export function removeTimeCompareRule(_this, rowIndex) {
    notPreview(_this)
    _this.nowOption.timeCompareRules.splice(rowIndex, 1)
}





export function dateData(dateRules, dataList) {
    let list = [...dataList]
    if (dateRules.length > 0) {
        try {
            list = list.map(data => {
                let resultData = Object.assign({}, data)
                for (let i = 0; i < dateRules.length; i++) {
                    let column = dateRules[i].column
                    resultData[column] = dayjs(resultData[column]).format(dateRules[i].newDateRule)
                }
                return resultData
            })
        } catch (e) {
            throw new Error('日期转换失败 请检查相关配置项')
        }
    }
    return list
}

export function handleDateRuleChange(_this, rowIndex, type, item) {
    notPreview(_this)
    _this.nowOption.dateRules[rowIndex][type] = item
}

export function saveDateRules(_this) {
    for (let i = 0; i < _this.nowOption.dateRules.length; i++) {
        let {column, newDateRule} = _this.nowOption.dateRules[i]
        if (column === '') {
            _this.$message.error('请选择转换字段')
            return
        }
        // if (originDateRule === '') {
        //   _this.$message.error('请选择原格式')
        //   return
        // }
        if (newDateRule === '') {
            _this.$message.error('请选择转换后格式')
            return
        }
    }

    const properties = _this.lf.getProperties(_this.nowOption.id)
    properties.dateRules = _this.nowOption.dateRules
    _this.lf.setProperties(_this.nowOption.id, properties)
    saveXlsxData(_this, _this.nowOption.id, dateData(_this.nowOption.dateRules, _this.xlsxData[_this.nowOption.id].data))
}

export function addDateRule(_this) {
    notPreview(_this)
    _this.nowOption.dateRules.push({
        column: '',
        // originDateRule: '',
        newDateRule: ''
    })
}

export function removeDateRule(_this, rowIndex) {
    notPreview(_this)
    _this.nowOption.dateRules.splice(rowIndex, 1)
}





export function contentReplaceData(contentReplaceRule, dataList) {
    let list = [...dataList]
    try {
        list = list.map(data => {
            const previewData = Object.assign({}, data)
            let regStr
            if (contentReplaceRule.matchEntirety) {
                regStr = `/^${contentReplaceRule.findContent}$/g`
            } else {
                regStr = `/${contentReplaceRule.findContent}/g`
            }
            if (contentReplaceRule.matchCase) {
                regStr += 'i'
            }
            // if (contentReplaceRule.isReplaceOrigin) {
            //   data[contentReplaceRule.column] = data[contentReplaceRule.column].toString().replace(eval(regStr), contentReplaceRule.replaceContent)
            // } else {
            //   data[contentReplaceRule.newColumn] = data[contentReplaceRule.column].toString().replace(eval(regStr), contentReplaceRule.replaceContent)
            // }
            previewData[contentReplaceRule.column] = data[contentReplaceRule.column].toString().replace(eval(regStr), contentReplaceRule.replaceContent)
            return previewData
        })
    } catch (e) {
        throw new Error('内容替换失败 请检查相关配置项')
    }
    return list
}

export function handleContentReplaceRuleChange(_this, item) {
    notPreview(_this)
    _this.nowOption.contentReplaceRule.column = item
}

export function saveContentReplaceRule(_this) {
    let {column, isReplaceOrigin, newColumn} = _this.nowOption.contentReplaceRule

    if (column === '') {
        _this.$message.error('内容替换字段不能为空')
        return
    }
    // if (!isReplaceOrigin && newColumn === '') {
    //   _this.$message.error('当不在原字段上替换时 新字段不能为空')
    //   return
    // }
    // if (!isReplaceOrigin && newColumn === column) {
    //   _this.$message.error('新字段不能与原字段重名')
    //   return
    // }

    const properties = _this.lf.getProperties(_this.nowOption.id)
    properties.contentReplaceRule = _this.nowOption.contentReplaceRule
    _this.lf.setProperties(_this.nowOption.id, properties)
    saveXlsxData(_this, _this.nowOption.id, contentReplaceData(_this.nowOption.contentReplaceRule, _this.xlsxData[_this.nowOption.id].data))
}





export function eliminateData(eliminateRule, dataList) {
    let list = [...dataList]

    try {
        list = list.filter((data, index, arr) => {
            if (eliminateRule.matchCase) {
                if (eliminateRule.matchEntirety) {
                    return !(data[eliminateRule.column].toString().toLowerCase() === eliminateRule.rule.toLowerCase())
                }
                return !data[eliminateRule.column].toString().toLowerCase().includes(eliminateRule.rule.toLowerCase())
            } else {
                if (eliminateRule.matchEntirety) {
                    return !(data[eliminateRule.column].toString() === eliminateRule.rule)
                }
                return !data[eliminateRule.column].toString().includes(eliminateRule.rule)
            }
        })
    } catch (e) {
        throw new Error('数据剔除失败 请检查相关配置项')
    }

    return list
}

export function handleEliminateRuleChange(_this, item) {
    notPreview(_this)
    _this.nowOption.eliminateRule.column = item
}

export function saveEliminateRule(_this) {
    let {column} = _this.nowOption.eliminateRule
    if (column === '') {
        _this.$message.error('数据剔除字段不能为空')
        return
    }
    const properties = _this.lf.getProperties(_this.nowOption.id)
    properties.eliminateRule = _this.nowOption.eliminateRule
    _this.lf.setProperties(_this.nowOption.id, properties)
    saveXlsxData(_this, _this.nowOption.id, eliminateData(_this.nowOption.eliminateRule, _this.xlsxData[_this.nowOption.id].data))
}





export function relatedData(_this, relatedRule, dataList, saveTableId) {
    if (saveTableId === '') {
        _this.$message.error('请选择最终保留的表')
        throw new Error('请选择最终保留的表.')
    }

    let list = [...dataList]

    if (relatedRule.length <= 0) {
        _this.$message.error('请配置关联项')
        throw new Error('请配置关联项.')
    }

    let ids = Object.keys(relatedRule[0]).filter((data, index, arr) => {
        return data !== saveTableId && data !== 'relatedRule'
    })

    try {
        for (let i = 0; i < relatedRule.length; i++) {
            let evalString = 'saveTableData'
            for (let j = 0; j < ids.length; j++) {
                evalString += ` && _this.xlsxData['${ids[j]}'].data.find(obj => obj['${relatedRule[i][ids[j]]}'] == saveTableData) !== undefined`
            }

            list = list.filter((data, index, arr) => {
                let saveTableData = data[relatedRule[i][saveTableId]]
                return eval(evalString)
            })
        }
    } catch (e) {
        throw new Error('数据关联失败 请检查关联配置项')
    }

    return list
}

export function addRelatedRule(_this) {
    notPreview(_this)
    let obj = {}
    for (let i = 0; i < _this.nowOption.tableIds.length; i++) {
        obj[_this.nowOption.tableIds[i]] = ''
    }
    obj.relatedRule = ''
    _this.nowOption.relatedRules.push(obj)
}

export function saveRelatedRules(_this) {
    if (_this.nowOption.saveTableId === '') {
        _this.$message.error('请选择最终保留的表')
        return
    }

    for (let i = 0; i < _this.nowOption.relatedRules.length; i++) {
        let keys = Object.keys(_this.nowOption.relatedRules[i])
        for (let j = 0; j < keys.length; j++) {
            let value = _this.nowOption.relatedRules[i][keys[j]]
            if (value === '') {
                _this.$message.error('关联配置不能为空')
                return;
            }
        }
    }

    const properties = _this.lf.getProperties(_this.nowOption.id)
    properties.relatedRules = _this.nowOption.relatedRules
    properties.saveTableId = _this.nowOption.saveTableId
    properties.tableIds = _this.nowOption.tableIds
    _this.lf.setProperties(_this.nowOption.id, properties)
    saveXlsxData(_this, _this.nowOption.id, relatedData(_this, _this.nowOption.relatedRules, _this.xlsxData[_this.nowOption.id].data, _this.nowOption.saveTableId))
}

export function handleRelatedChange(_this, rowIndex, type, item) {
    notPreview(_this)
    _this.nowOption.relatedRules[rowIndex][type] = item
}

export function removeRelatedRule(_this, index) {
    notPreview(_this)
    _this.nowOption.relatedRules.splice(index, 1)
}

export function handleSaveTableChange(_this, index) {
    notPreview(_this)
    let id = _this.nowOption.tableIds[index]
    _this.$set(_this.nowOption, 'saveTableId', id)
    _this.$set(_this.xlsxData, _this.nowOption.id, Object.assign({}, _this.xlsxData[id]))
}

export function previewRelated(_this) {
    if (_this.nowOption.saveTableId === '') {
        _this.$message.error('请选择最终保留的表')
        return
    }
    _this.nowOption.preview = true
}





export function deduplicateData(deduplicateRules, dataList) {
    let list = [...dataList]
    let evalString = ''
    for (let i = 0; i < deduplicateRules.length; i++) {
        if (i !== 0) {
            evalString += ` + data['${deduplicateRules[i]}']`
        } else {
            evalString += `data['${deduplicateRules[i]}']`
        }
    }
    if (evalString !== '') {
        let temp = []
        try {
            list = list.filter((data, index, arr) => {
                let result = eval(evalString)
                if (temp.indexOf(result) === -1) {
                    temp.push(result)
                    return true
                } else {
                    return false
                }
            })
        } catch (e) {
            throw new Error('数据去重失败 请检查相关配置项')
        }
    }
    return list
}

export function handleDeduplicateRuleChange(_this, index, item) {
    notPreview(_this)
    _this.nowOption.deduplicateRules[index] = item
}

export function addDeduplicateRule(_this) {
    notPreview(_this)
    _this.nowOption.deduplicateRules.push('')
}

export function removeDeduplicateRule(_this, index) {
    notPreview(_this)
    _this.nowOption.deduplicateRules.splice(index, 1)
}

export function saveDeduplicateRules(_this) {
    for (let i = 0; i < _this.nowOption.deduplicateRules.length; i++) {
        if (_this.nowOption.deduplicateRules[i] === '') {
            _this.$message.error('去重字段不能为空')
            return
        }
    }
    const properties = _this.lf.getProperties(_this.nowOption.id)
    properties.deduplicateRules = _this.nowOption.deduplicateRules
    _this.lf.setProperties(_this.nowOption.id, properties)
    saveXlsxData(_this, _this.nowOption.id, deduplicateData(_this.nowOption.deduplicateRules, _this.xlsxData[_this.nowOption.id].data))
}





export function filterData(filterRules, dataList) {
    let list = [...dataList]
    let evalString = ''
    for (let i = 0; i < filterRules.length; i++) {
        const rule = filterRules[i]
        if (rule.filterRule.startsWith('.')) {
            if (i === 0) {
                if (rule.filterRule === '.match') {
                    evalString += `/${rule.start}/.test(data['${rule.column}'].toString())`
                } else {
                    evalString += `data['${rule.column}'].toString()${rule.filterRule}('${rule.start}')`
                }
            } else {
                evalString += rule.type
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
                evalString += `${rule.type}data['${rule.column}']${rule.filterRule}'${rule.start}'`
            }
        }

    }
    try {
        list = list.filter((data, index, arr) => {
            return eval(evalString)
        })
    } catch (e) {
        throw new Error('数据筛选失败 请检查相关配置项')
    }
    return list
}

export function handleFilterRuleChange(_this, rowIndex, property, value) {
    notPreview(_this)
    _this.nowOption.filterRules[rowIndex][property] = value
}

export function addFilterRule(_this) {
    notPreview(_this)
    _this.nowOption.filterRules.push({
        start: '',
        filterRule: '',
        column: '',
        type: ' && '
    })
}

export function removeFilterRule(_this, index) {
    notPreview(_this)
    _this.nowOption.filterRules.splice(index, 1)
}

export function saveFilterRules(_this) {
    for (let i = 0; i < _this.nowOption.filterRules.length; i++) {
        let {filterRule, column, type} = _this.nowOption.filterRules[i]
        if (filterRule === '') {
            _this.$message.error('筛选规则不能为空')
            return
        }
        if (column === '') {
            _this.$message.error('筛选字段不能为空')
            return
        }
        if (type === '') {
            _this.$message.error('与或规则不能为空')
            return
        }
    }

    const properties = _this.lf.getProperties(_this.nowOption.id)
    properties.filterRules = _this.nowOption.filterRules
    _this.lf.setProperties(_this.nowOption.id, properties)
    saveXlsxData(_this, _this.nowOption.id, filterData(_this.nowOption.filterRules, _this.xlsxData[_this.nowOption.id].data))
}





export async function beforeUpload(_this, file) {
    const isExcel = file.type === 'application/vnd.ms-excel' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'text/csv'
    if (!isExcel) {
        _this.$message.error('只能上传 xlsx xls csv格式')
        return new Promise((resolve, reject) => reject())
    }
    const data = await readFile(file)
    const workbook = read(data, {type: 'binary', cellDates: true})
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    let result = utils.sheet_to_json(worksheet)
    if (result.length === 0) {
        _this.$message.error('上传的表为空表')
        return new Promise((resolve, reject) => reject())
    }
    const keys = Object.keys(result[0])
    result = result.map(data => {
        for (let i = 0; i < keys.length; i++) {
            if (!(data[keys[i]] instanceof String)) {
                if (data[keys[i]] instanceof Date) {
                    data[keys[i]] = dayjs(data[keys[i]]).format('YYYY-MM-DD HH:mm:ss')
                } else {
                    data[keys[i]] = data[keys[i]].toString()
                }
            }
        }
        return data
    })

    if ('columnList' in _this.nowOption) {
        for (let i = 0; i < _this.nowOption.columnList.length; i++) {
            if (keys.indexOf(_this.nowOption.columnList[i]) === -1) {
                _this.$message.error('上传的表数据有误')
                return new Promise((resolve, reject) => reject())
            }
        }
    }

    const columns = []
    const columnList = []
    for (let i = 0; i < keys.length; i++) {
        columns.push({title: keys[i], dataIndex: keys[i], key: keys[i], show: true})
        columnList.push(keys[i])
    }
    _this.$set(_this.xlsxData, _this.nowOption.id,
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
    )
    return new Promise((resolve, reject) => reject())
}

function readFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.readAsBinaryString(file)
        reader.onload = (ev) => {
            resolve(ev.target.result)
        }
    })
}

export function setUploadType(_this, data, inComingNodes) {
    if ('columnList' in data.data.properties) {
        _this.$set(_this.nowOption, 'columnList', [...data.data.properties.columnList])
    }
}

export function setDataFilterType(_this, data, inComingNodes) {
    for (let i = 0; i < inComingNodes.length; i++) {
        _this.$set(_this.xlsxData, data.data.id, Object.assign({}, _this.xlsxData[inComingNodes[i].id]))
    }

    if ('filterRules' in data.data.properties) {
        _this.$set(_this.nowOption, 'filterRules', [...data.data.properties.filterRules])
    } else {
        _this.$set(_this.nowOption, 'filterRules', [])
    }
}

export function setDeduplicateType(_this, data, inComingNodes) {
    for (let i = 0; i < inComingNodes.length; i++) {
        _this.$set(_this.xlsxData, data.data.id, Object.assign({}, _this.xlsxData[inComingNodes[i].id]))
    }

    if ('deduplicateRules' in data.data.properties) {
        _this.$set(_this.nowOption, 'deduplicateRules', [...data.data.properties.deduplicateRules])
    } else {
        _this.$set(_this.nowOption, 'deduplicateRules', [])
    }
}

export function setRelatedType(_this, data, inComingNodes) {
    let sortInComingNodes = inComingNodes.sort((a, b) => a.id - b.id)
    let sortInComingNodeIds = sortInComingNodes.map(data => data.id)
    _this.$set(_this.nowOption, 'tableIds', sortInComingNodes.map(data => data.id))
    _this.$set(_this.nowOption, 'tableNames', sortInComingNodes.map(data => data.text.value))

    if ('relatedRules' in data.data.properties) {

        let relatedRules = data.data.properties.relatedRules
        let resultRelatedRules = []
        for (let i = 0; i < relatedRules.length; i++) {
            let keys = Object.keys(relatedRules[i])
            let flag = true
            for (let j = 0; j < keys.length; j++) {
                if (keys[j] !== 'relatedRule' && sortInComingNodeIds.indexOf(keys[j]) === -1) {
                    flag = false
                    break
                }
            }
            if (flag) {
                resultRelatedRules.push(relatedRules[i])
            }
        }
        _this.$set(_this.nowOption, 'relatedRules', resultRelatedRules)
    } else {
        _this.$set(_this.nowOption, 'relatedRules', [])
    }

    if ('saveTableId' in data.data.properties) {
        if (data.data.properties.saveTableId in sortInComingNodeIds) {
            _this.$set(_this.nowOption, 'saveTableId', data.data.properties.saveTableId)
            _this.$set(_this.xlsxData, data.data.id, Object.assign({}, _this.xlsxData[data.data.properties.saveTableId]))
        } else {
            _this.$set(_this.nowOption, 'saveTableId', sortInComingNodeIds[0])
            _this.$set(_this.xlsxData, data.data.id, Object.assign({}, _this.xlsxData[sortInComingNodeIds[0]]))
        }
    } else {
        _this.$set(_this.nowOption, 'saveTableId', sortInComingNodeIds[0])
        _this.$set(_this.xlsxData, data.data.id, Object.assign({}, _this.xlsxData[sortInComingNodeIds[0]]))
    }
    console.log(_this.lf.getProperties(data.data.id))
}

export function setFinishType(_this, data, inComingNodes) {
    if (inComingNodes.length > 1) {
        _this.$message.error('结束节点前不能被一个节点以上连接')
        return
    }

    _this.$set(_this.xlsxData, data.data.id, Object.assign({}, _this.xlsxData[inComingNodes[0].id]))
}

export function setEliminateType(_this, data, inComingNodes) {
    for (let i = 0; i < inComingNodes.length; i++) {
        _this.$set(_this.xlsxData, data.data.id, Object.assign({}, _this.xlsxData[inComingNodes[i].id]))
    }

    if ('eliminateRule' in data.data.properties) {
        _this.$set(_this.nowOption, 'eliminateRule', Object.assign({}, data.data.properties.eliminateRule))
    } else {
        _this.$set(_this.nowOption, 'eliminateRule', {column: '', rule: '', matchCase: false, matchEntirety: false})
    }
}

export function setContentReplaceType(_this, data, inComingNodes) {
    for (let i = 0; i < inComingNodes.length; i++) {
        _this.$set(_this.xlsxData, data.data.id, Object.assign({}, _this.xlsxData[inComingNodes[i].id]))
    }

    if ('contentReplaceRule' in data.data.properties) {
        _this.$set(_this.nowOption, 'contentReplaceRule', Object.assign({}, data.data.properties.contentReplaceRule))
    } else {
        _this.$set(_this.nowOption, 'contentReplaceRule', {
            column: '',
            findContent: '',
            replaceContent: '',
            matchCase: false,
            matchEntirety: false,
            isReplaceOrigin: false,
            newColumn: ''
        })
    }
}

export function setDateType(_this, data, inComingNodes) {
    for (let i = 0; i < inComingNodes.length; i++) {
        _this.$set(_this.xlsxData, data.data.id, Object.assign({}, _this.xlsxData[inComingNodes[i].id]))
    }

    if ('dateRules' in data.data.properties) {
        _this.$set(_this.nowOption, 'dateRules', [...data.data.properties.dateRules])
    } else {
        _this.$set(_this.nowOption, 'dateRules', [])
    }
}

export function setTimeCompareType(_this, data, inComingNodes) {
    for (let i = 0; i < inComingNodes.length; i++) {
        _this.$set(_this.xlsxData, data.data.id, Object.assign({}, _this.xlsxData[inComingNodes[i].id]))
    }

    if ('timeCompareRules' in data.data.properties) {
        _this.$set(_this.nowOption, 'timeCompareRules', [...data.data.properties.timeCompareRules])
    } else {
        _this.$set(_this.nowOption, 'timeCompareRules', [])
    }
}

export function setNullFillType(_this, data, inComingNodes) {
    for (let i = 0; i < inComingNodes.length; i++) {
        _this.$set(_this.xlsxData, data.data.id, Object.assign({}, _this.xlsxData[inComingNodes[i].id]))
    }

    if ('nullFillRules' in data.data.properties) {
        _this.$set(_this.nowOption, 'nullFillRules', [...data.data.properties.nullFillRules])
    } else {
        _this.$set(_this.nowOption, 'nullFillRules', [])
    }
}
