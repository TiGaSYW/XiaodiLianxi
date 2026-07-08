// 默认配方库（当本地没有保存的自定义数据时使用）
window.defaultRecipes = [
    {
        id: 1,
        name: '生椰拿铁',
        type: '拿铁类',
        ingredients: [
            { name: '冰块', amount: '满杯' },
            { name: '原味糖浆', amount: '1泵' },
            { name: '厚椰乳', amount: '200ml' },
            { name: '浓缩咖啡', amount: '2 shot' }
        ],
        notes: '先加冰块和糖浆，再倒入椰乳，最后萃取浓缩咖啡。'
    },
    {
        id: 2,
        name: '陨石拿铁',
        type: '拿铁类',
        ingredients: [
            { name: '黑糖浆', amount: '2泵' },
            { name: '寒天晶球', amount: '1勺' },
            { name: '冰块', amount: '八分满' },
            { name: '牛奶', amount: '150ml' },
            { name: '浓缩咖啡', amount: '2 shot' }
        ],
        notes: '杯壁挂黑糖浆，加入晶球和冰块，倒入牛奶后加浓缩。'
    },
    {
        id: 3,
        name: '丝绒拿铁',
        type: '拿铁类',
        ingredients: [
            { name: '冰块', amount: '满杯' },
            { name: '丝绒厚乳', amount: '180ml' },
            { name: '浓缩咖啡', amount: '2 shot' }
        ],
        notes: '口感绵密，默认不额外加糖浆。'
    },
    {
        id: 4,
        name: '橙C美式',
        type: '果咖类',
        ingredients: [
            { name: '冰块', amount: '满杯' },
            { name: '原味糖浆', amount: '1泵' },
            { name: '橙汁', amount: '150ml' },
            { name: '直饮水', amount: '50ml' },
            { name: '浓缩咖啡', amount: '2 shot' }
        ],
        notes: '果汁与咖啡分层效果，先加果汁和水，最后加咖啡。'
    },
    {
        id: 5,
        name: '冰吸生椰拿铁',
        type: '拿铁类',
        ingredients: [
            { name: '冰块', amount: '满杯' },
            { name: '清凉糖浆', amount: '1泵' },
            { name: '厚椰乳', amount: '180ml' },
            { name: '浓缩咖啡', amount: '2 shot' }
        ],
        notes: '夏日特饮，清凉口感，需摇匀。'
    },
    {
        id: 6,
        name: '标准美式',
        type: '美式类',
        ingredients: [
            { name: '冰块', amount: '满杯' },
            { name: '直饮水', amount: '200ml' },
            { name: '浓缩咖啡', amount: '2 shot' }
        ],
        notes: '最基础的做法，先水后咖啡。'
    },
    {
        id: 7,
        name: '茉莉花香拿铁',
        type: '拿铁类',
        ingredients: [
            { name: '冰块', amount: '满杯' },
            { name: '茉莉花浆', amount: '2泵' },
            { name: '牛奶', amount: '180ml' },
            { name: '浓缩咖啡', amount: '2 shot' }
        ],
        notes: '花香浓郁。'
    },
    {
        id: 8,
        name: '卡布奇诺',
        type: '拿铁类 (热)',
        ingredients: [
            { name: '原味糖浆', amount: '1泵' },
            { name: '浓缩咖啡', amount: '2 shot' },
            { name: '热牛奶', amount: '150ml' },
            { name: '奶泡', amount: '满杯' }
        ],
        notes: '热饮，奶泡要绵密。'
    }
];

// 默认的物料可选份量（当配方库动态生成不足时作为补充后备）
window.defaultIngredientCategories = {
    '冰块': ['满杯', '八分满', '少冰', '去冰'],
    '原味糖浆': ['半泵', '1泵', '2泵', '3泵', '4泵'],
    '黑糖浆': ['半泵', '1泵', '2泵', '3泵', '4泵'],
    '清凉糖浆': ['半泵', '1泵', '2泵', '3泵', '4泵'],
    '茉莉花浆': ['半泵', '1泵', '2泵', '3泵', '4泵'],
    '厚椰乳': ['100ml', '150ml', '180ml', '200ml'],
    '丝绒厚乳': ['100ml', '150ml', '180ml', '200ml'],
    '牛奶': ['100ml', '150ml', '180ml', '200ml'],
    '热牛奶': ['100ml', '150ml', '180ml', '200ml'],
    '橙汁': ['100ml', '150ml', '180ml', '200ml'],
    '直饮水': ['50ml', '100ml', '150ml', '200ml'],
    '浓缩咖啡': ['1 shot', '2 shot', '3 shot', '4 shot'],
    '寒天晶球': ['1勺', '2勺', '3勺'],
    '奶泡': ['满杯', '八分满']
};