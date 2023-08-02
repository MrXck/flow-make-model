export let info = {
    "nodes": [
        {
            "id": "4a6978b7-b8a2-4c45-b2c6-c5dde956b858",
            "type": "circle",
            "x": 420,
            "y": 120,
            "properties": {
                "type": "upload"
            },
            "text": {
                "x": 420,
                "y": 120,
                "value": "开始"
            }
        },
        {
            "id": "8ef2fe61-d012-40b5-82e9-3c75c007de52",
            "type": "circle",
            "x": 280,
            "y": 320,
            "properties": {
                "type": "upload"
            },
            "text": {
                "x": 280,
                "y": 320,
                "value": "开始"
            }
        },
        {
            "id": "24caa356-2174-4da6-9ede-825381f9a9f8",
            "type": "rect",
            "x": 1020,
            "y": 240,
            "properties": {
                "type": "related",
                "relatedRules": [
                    {
                        "7a25e0bc-705c-43ad-acfe-2d0ddad5861d": "4",
                        "da200fe2-53ee-40f6-aa51-975261d2959b": "的撒发生",
                        "8d26b58d-b474-443a-a021-bdd045184200": "股份第三个发送的",
                        "relatedRule": " == "
                    }
                ],
                "saveTableId": "7a25e0bc-705c-43ad-acfe-2d0ddad5861d",
                "tableIds": [
                    "7a25e0bc-705c-43ad-acfe-2d0ddad5861d",
                    "da200fe2-53ee-40f6-aa51-975261d2959b",
                    "8d26b58d-b474-443a-a021-bdd045184200"
                ]
            },
            "text": {
                "x": 1020,
                "y": 240,
                "value": "合并"
            }
        },
        {
            "id": "c2b84045-2263-4e41-a16a-ca85d07ed21d",
            "type": "circle",
            "x": 1280,
            "y": 240,
            "properties": {
                "type": "finish"
            },
            "text": {
                "x": 1280,
                "y": 240,
                "value": "结束"
            }
        },
        {
            "id": "6ed2820c-c5b4-4329-9ceb-7eafc3854910",
            "type": "circle",
            "x": 280,
            "y": 500,
            "properties": {
                "type": "upload"
            },
            "text": {
                "x": 280,
                "y": 500,
                "value": "开始"
            }
        },
        {
            "id": "f942f633-2062-4e9c-b4bb-ef23e35f9a14",
            "type": "rect",
            "x": 520,
            "y": 500,
            "properties": {
                "type": "dataFilter",
                "filterRules": [
                    {
                        "start": "123",
                        "filterRule": ".includes",
                        "column": "name",
                        "type": " && "
                    }
                ]
            },
            "text": {
                "x": 520,
                "y": 500,
                "value": "数据过滤"
            }
        },
        {
            "id": "7a25e0bc-705c-43ad-acfe-2d0ddad5861d",
            "type": "rect",
            "x": 800,
            "y": 420,
            "properties": {
                "type": "related",
                "relatedRules": [
                    {
                        "f942f633-2062-4e9c-b4bb-ef23e35f9a14": "name",
                        "6cd67a1c-545b-4ff4-b651-4b4e1563c36d": "模型规则",
                        "57d7e976-0d25-4bff-bd68-6a9c0565c477": "4",
                        "relatedRule": " != "
                    }
                ],
                "saveTableId": "57d7e976-0d25-4bff-bd68-6a9c0565c477",
                "tableIds": [
                    "f942f633-2062-4e9c-b4bb-ef23e35f9a14",
                    "6cd67a1c-545b-4ff4-b651-4b4e1563c36d",
                    "57d7e976-0d25-4bff-bd68-6a9c0565c477"
                ]
            },
            "text": {
                "x": 800,
                "y": 420,
                "value": "合并"
            }
        },
        {
            "id": "ab66a2ae-1b63-4497-9463-44e549c18eb3",
            "type": "circle",
            "x": 280,
            "y": 660,
            "properties": {
                "type": "upload"
            },
            "text": {
                "x": 280,
                "y": 660,
                "value": "开始"
            }
        },
        {
            "id": "6cd67a1c-545b-4ff4-b651-4b4e1563c36d",
            "type": "rect",
            "x": 520,
            "y": 660,
            "properties": {
                "type": "dataFilter",
                "filterRules": [
                    {
                        "start": "123",
                        "filterRule": " == ",
                        "column": "模型名称",
                        "type": " && "
                    }
                ]
            },
            "text": {
                "x": 520,
                "y": 660,
                "value": "数据过滤"
            }
        },
        {
            "id": "da200fe2-53ee-40f6-aa51-975261d2959b",
            "type": "rect",
            "x": 840,
            "y": 120,
            "properties": {
                "type": "dataFilter",
                "filterRules": [
                    {
                        "start": "女",
                        "filterRule": " == ",
                        "column": "萨达",
                        "type": " && "
                    }
                ]
            },
            "text": {
                "x": 840,
                "y": 120,
                "value": "数据过滤"
            }
        },
        {
            "id": "8d26b58d-b474-443a-a021-bdd045184200",
            "type": "rect",
            "x": 800,
            "y": -40,
            "properties": {
                "type": "deduplicate",
                "deduplicateRules": [
                    "萨达"
                ]
            },
            "text": {
                "x": 800,
                "y": -40,
                "value": "去重"
            }
        },
        {
            "id": "681c820a-4d88-428a-8281-25df386bb7d0",
            "type": "rect",
            "x": 620,
            "y": 120,
            "properties": {
                "type": "eliminate",
                "eliminateRule": {
                    "column": "股份第三个发送的",
                    "rule": "123",
                    "matchCase": false,
                    "matchEntirety": true
                }
            },
            "text": {
                "x": 620,
                "y": 120,
                "value": "数据剔除"
            }
        },
        {
            "id": "e7d9db23-476a-439f-b2d6-122570e80d13",
            "type": "circle",
            "x": 380,
            "y": -40,
            "properties": {
                "type": "upload"
            },
            "text": {
                "x": 380,
                "y": -40,
                "value": "开始"
            }
        },
        {
            "id": "39d3b946-13b1-4db3-bde5-438ce36f1e43",
            "type": "rect",
            "x": 540,
            "y": -40,
            "properties": {
                "type": "date",
                "dateRules": [
                    {
                        "column": "时间",
                        "newDateRule": "YYYY-MM-DD"
                    }
                ]
            },
            "text": {
                "x": 540,
                "y": -40,
                "value": "日期转换"
            }
        },
        {
            "id": "cdc05a39-5dd4-4dc3-aa8d-6cd386853ffb",
            "type": "rect",
            "x": 680,
            "y": -40,
            "properties": {
                "type": "timeCompare",
                "timeCompareRules": [
                    {
                        "leftColumn": "时间",
                        "rule": "isSame",
                        "rightColumn": "时间",
                        "type": " && "
                    },
                    {
                        "leftColumn": "时间",
                        "rule": "!=",
                        "rightColumn": "时间",
                        "type": " || "
                    }
                ]
            },
            "text": {
                "x": 680,
                "y": -40,
                "value": "时间比较"
            }
        },
        {
            "id": "57d7e976-0d25-4bff-bd68-6a9c0565c477",
            "type": "rect",
            "x": 520,
            "y": 320,
            "properties": {
                "type": "nullFill",
                "nullFillRules": [
                    {
                        "column": "77",
                        "conditions": [
                            "custom"
                        ],
                        "custom": "123",
                        "rule": "统一填充",
                        "fillValue": "777"
                    }
                ]
            },
            "text": {
                "x": 520,
                "y": 320,
                "value": "空值填充"
            }
        }
    ],
    "edges": [
        {
            "id": "f25ffecf-d909-43fa-8856-78b22c3dab50",
            "type": "polyline",
            "sourceNodeId": "24caa356-2174-4da6-9ede-825381f9a9f8",
            "targetNodeId": "c2b84045-2263-4e41-a16a-ca85d07ed21d",
            "startPoint": {
                "x": 1070,
                "y": 240
            },
            "endPoint": {
                "x": 1230,
                "y": 240
            },
            "properties": {},
            "pointsList": [
                {
                    "x": 1070,
                    "y": 240
                },
                {
                    "x": 1230,
                    "y": 240
                }
            ]
        },
        {
            "id": "84fad638-e651-432f-8bc9-d09ce3e14908",
            "type": "polyline",
            "sourceNodeId": "6ed2820c-c5b4-4329-9ceb-7eafc3854910",
            "targetNodeId": "f942f633-2062-4e9c-b4bb-ef23e35f9a14",
            "startPoint": {
                "x": 330,
                "y": 500
            },
            "endPoint": {
                "x": 470,
                "y": 500
            },
            "properties": {},
            "pointsList": [
                {
                    "x": 330,
                    "y": 500
                },
                {
                    "x": 470,
                    "y": 500
                }
            ]
        },
        {
            "id": "b5b1dee9-c16c-49da-916a-dadab3b46bf3",
            "type": "polyline",
            "sourceNodeId": "f942f633-2062-4e9c-b4bb-ef23e35f9a14",
            "targetNodeId": "7a25e0bc-705c-43ad-acfe-2d0ddad5861d",
            "startPoint": {
                "x": 570,
                "y": 500
            },
            "endPoint": {
                "x": 750,
                "y": 420
            },
            "properties": {},
            "pointsList": [
                {
                    "x": 570,
                    "y": 500
                },
                {
                    "x": 600,
                    "y": 500
                },
                {
                    "x": 600,
                    "y": 420
                },
                {
                    "x": 750,
                    "y": 420
                }
            ]
        },
        {
            "id": "6f81ce20-05ad-4ad8-87da-cf814ff751d2",
            "type": "polyline",
            "sourceNodeId": "7a25e0bc-705c-43ad-acfe-2d0ddad5861d",
            "targetNodeId": "24caa356-2174-4da6-9ede-825381f9a9f8",
            "startPoint": {
                "x": 850,
                "y": 420
            },
            "endPoint": {
                "x": 970,
                "y": 240
            },
            "properties": {},
            "pointsList": [
                {
                    "x": 850,
                    "y": 420
                },
                {
                    "x": 940,
                    "y": 420
                },
                {
                    "x": 940,
                    "y": 240
                },
                {
                    "x": 970,
                    "y": 240
                }
            ]
        },
        {
            "id": "967416ad-99b0-40c5-9e23-8bb1aad60be9",
            "type": "polyline",
            "sourceNodeId": "ab66a2ae-1b63-4497-9463-44e549c18eb3",
            "targetNodeId": "6cd67a1c-545b-4ff4-b651-4b4e1563c36d",
            "startPoint": {
                "x": 330,
                "y": 660
            },
            "endPoint": {
                "x": 470,
                "y": 660
            },
            "properties": {},
            "pointsList": [
                {
                    "x": 330,
                    "y": 660
                },
                {
                    "x": 470,
                    "y": 660
                }
            ]
        },
        {
            "id": "57f99c69-c943-459e-a002-3f0f9c53e4ac",
            "type": "polyline",
            "sourceNodeId": "6cd67a1c-545b-4ff4-b651-4b4e1563c36d",
            "targetNodeId": "7a25e0bc-705c-43ad-acfe-2d0ddad5861d",
            "startPoint": {
                "x": 570,
                "y": 660
            },
            "endPoint": {
                "x": 750,
                "y": 420
            },
            "properties": {},
            "pointsList": [
                {
                    "x": 570,
                    "y": 660
                },
                {
                    "x": 720,
                    "y": 660
                },
                {
                    "x": 720,
                    "y": 420
                },
                {
                    "x": 750,
                    "y": 420
                }
            ]
        },
        {
            "id": "57752aca-af2e-4e4f-a4af-f0dd56252854",
            "type": "polyline",
            "sourceNodeId": "da200fe2-53ee-40f6-aa51-975261d2959b",
            "targetNodeId": "24caa356-2174-4da6-9ede-825381f9a9f8",
            "startPoint": {
                "x": 890,
                "y": 120
            },
            "endPoint": {
                "x": 970,
                "y": 240
            },
            "properties": {},
            "pointsList": [
                {
                    "x": 890,
                    "y": 120
                },
                {
                    "x": 940,
                    "y": 120
                },
                {
                    "x": 940,
                    "y": 240
                },
                {
                    "x": 970,
                    "y": 240
                }
            ]
        },
        {
            "id": "61dd1118-f25b-4ee6-9ab3-a193ecd9c412",
            "type": "polyline",
            "sourceNodeId": "8d26b58d-b474-443a-a021-bdd045184200",
            "targetNodeId": "24caa356-2174-4da6-9ede-825381f9a9f8",
            "startPoint": {
                "x": 850,
                "y": -40
            },
            "endPoint": {
                "x": 970,
                "y": 240
            },
            "properties": {},
            "pointsList": [
                {
                    "x": 850,
                    "y": -40
                },
                {
                    "x": 940,
                    "y": -40
                },
                {
                    "x": 940,
                    "y": 240
                },
                {
                    "x": 970,
                    "y": 240
                }
            ]
        },
        {
            "id": "f58208b5-b5c7-4ead-98e1-91cc897079e7",
            "type": "polyline",
            "sourceNodeId": "4a6978b7-b8a2-4c45-b2c6-c5dde956b858",
            "targetNodeId": "681c820a-4d88-428a-8281-25df386bb7d0",
            "startPoint": {
                "x": 470,
                "y": 120
            },
            "endPoint": {
                "x": 570,
                "y": 120
            },
            "properties": {},
            "pointsList": [
                {
                    "x": 470,
                    "y": 120
                },
                {
                    "x": 570,
                    "y": 120
                }
            ]
        },
        {
            "id": "36524ba7-0674-4380-b481-a5028d2180c7",
            "type": "polyline",
            "sourceNodeId": "681c820a-4d88-428a-8281-25df386bb7d0",
            "targetNodeId": "da200fe2-53ee-40f6-aa51-975261d2959b",
            "startPoint": {
                "x": 670,
                "y": 120
            },
            "endPoint": {
                "x": 790,
                "y": 120
            },
            "properties": {},
            "pointsList": [
                {
                    "x": 670,
                    "y": 120
                },
                {
                    "x": 790,
                    "y": 120
                }
            ]
        },
        {
            "id": "27657602-b9cb-4777-b876-fbb86812f767",
            "type": "polyline",
            "sourceNodeId": "e7d9db23-476a-439f-b2d6-122570e80d13",
            "targetNodeId": "39d3b946-13b1-4db3-bde5-438ce36f1e43",
            "startPoint": {
                "x": 430,
                "y": -40
            },
            "endPoint": {
                "x": 490,
                "y": -40
            },
            "properties": {},
            "pointsList": [
                {
                    "x": 430,
                    "y": -40
                },
                {
                    "x": 490,
                    "y": -40
                }
            ]
        },
        {
            "id": "f4f77b53-408c-4fad-bfb3-a73a3697aac7",
            "type": "polyline",
            "sourceNodeId": "39d3b946-13b1-4db3-bde5-438ce36f1e43",
            "targetNodeId": "cdc05a39-5dd4-4dc3-aa8d-6cd386853ffb",
            "startPoint": {
                "x": 590,
                "y": -40
            },
            "endPoint": {
                "x": 630,
                "y": -40
            },
            "properties": {},
            "pointsList": [
                {
                    "x": 590,
                    "y": -40
                },
                {
                    "x": 620,
                    "y": -40
                },
                {
                    "x": 620,
                    "y": -40
                },
                {
                    "x": 600,
                    "y": -40
                },
                {
                    "x": 600,
                    "y": -40
                },
                {
                    "x": 630,
                    "y": -40
                }
            ]
        },
        {
            "id": "8b20b9c1-795b-4046-b721-9f811f58233f",
            "type": "polyline",
            "sourceNodeId": "cdc05a39-5dd4-4dc3-aa8d-6cd386853ffb",
            "targetNodeId": "8d26b58d-b474-443a-a021-bdd045184200",
            "startPoint": {
                "x": 730,
                "y": -40
            },
            "endPoint": {
                "x": 750,
                "y": -40
            },
            "properties": {},
            "pointsList": [
                {
                    "x": 730,
                    "y": -40
                },
                {
                    "x": 760,
                    "y": -40
                },
                {
                    "x": 760,
                    "y": -40
                },
                {
                    "x": 720,
                    "y": -40
                },
                {
                    "x": 720,
                    "y": -40
                },
                {
                    "x": 750,
                    "y": -40
                }
            ]
        },
        {
            "id": "f3790252-99a1-4c84-89a2-97641b374888",
            "type": "polyline",
            "sourceNodeId": "8ef2fe61-d012-40b5-82e9-3c75c007de52",
            "targetNodeId": "57d7e976-0d25-4bff-bd68-6a9c0565c477",
            "startPoint": {
                "x": 330,
                "y": 320
            },
            "endPoint": {
                "x": 470,
                "y": 320
            },
            "properties": {},
            "pointsList": [
                {
                    "x": 330,
                    "y": 320
                },
                {
                    "x": 470,
                    "y": 320
                }
            ]
        },
        {
            "id": "0ea3f5a9-22d5-4cf2-a838-f6fa3f3a85b1",
            "type": "polyline",
            "sourceNodeId": "57d7e976-0d25-4bff-bd68-6a9c0565c477",
            "targetNodeId": "7a25e0bc-705c-43ad-acfe-2d0ddad5861d",
            "startPoint": {
                "x": 570,
                "y": 320
            },
            "endPoint": {
                "x": 750,
                "y": 420
            },
            "properties": {},
            "pointsList": [
                {
                    "x": 570,
                    "y": 320
                },
                {
                    "x": 600,
                    "y": 320
                },
                {
                    "x": 600,
                    "y": 420
                },
                {
                    "x": 750,
                    "y": 420
                }
            ]
        }
    ]
}
// info = {}