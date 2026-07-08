const { createApp, ref, computed, watch, nextTick } = Vue;

const app = createApp({
    setup() {
        const currentTab = ref('home'); // 'home', 'library', 'exam_view', 'mistakes', 'manage', 'manage_edit', 'stats'
        
        // --- 核心数据（持久化） ---
        const storedRecipes = localStorage.getItem('luckin_recipes');
        const recipes = ref(storedRecipes ? JSON.parse(storedRecipes) : window.defaultRecipes);
        
        watch(recipes, (newVal) => {
            localStorage.setItem('luckin_recipes', JSON.stringify(newVal));
        }, { deep: true });

        // --- 防止误刷新 ---
        window.addEventListener('beforeunload', (e) => {
            if (examStarted.value && !examFinished.value) {
                e.preventDefault();
                e.returnValue = '考试进行中，确定要离开吗？进度将丢失。';
            }
        });

        // --- 动态计算可用物料与份量 ---
        const availableIngredients = computed(() => {
            const set = new Set(Object.keys(window.defaultIngredientCategories));
            recipes.value.forEach(r => r.ingredients.forEach(i => set.add(i.name)));
            return Array.from(set);
        });

        const availableAmounts = computed(() => {
            if (!currentIngredient.value) return [];
            const set = new Set(window.defaultIngredientCategories[currentIngredient.value] || []);
            recipes.value.forEach(r => {
                r.ingredients.forEach(i => {
                    if (i.name === currentIngredient.value) set.add(i.amount);
                });
            });
            return Array.from(set);
        });

        // --- 配方库逻辑 ---
        const searchQuery = ref('');
        const expandedRecipe = ref(null);
        
        const filteredRecipes = computed(() => {
            if (!searchQuery.value) return recipes.value;
            const lowerQuery = searchQuery.value.toLowerCase();
            return recipes.value.filter(r => 
                r.name.toLowerCase().includes(lowerQuery) || 
                r.type.toLowerCase().includes(lowerQuery)
            );
        });

        const toggleRecipe = (id) => {
            expandedRecipe.value = expandedRecipe.value === id ? null : id;
        };

        // --- 错题集与考试历史逻辑 ---
        const mistakeBookIds = ref(JSON.parse(localStorage.getItem('luckin_mistakes') || '[]'));
        
        // 考试历史记录 (只记录模拟考试的分数)
        const examHistory = ref(JSON.parse(localStorage.getItem('luckin_exam_history') || '[]'));
        
        const mistakeRecipes = computed(() => {
            return recipes.value.filter(r => mistakeBookIds.value.includes(r.id));
        });

        const addToMistakes = (id) => {
            if (!mistakeBookIds.value.includes(id)) {
                mistakeBookIds.value.push(id);
                localStorage.setItem('luckin_mistakes', JSON.stringify(mistakeBookIds.value));
            }
        };

        const removeFromMistakes = (id) => {
            mistakeBookIds.value = mistakeBookIds.value.filter(mId => mId !== id);
            localStorage.setItem('luckin_mistakes', JSON.stringify(mistakeBookIds.value));
        };

        // --- 统一考试/记忆逻辑 ---
        const examMode = ref('memory'); // 'memory' (快速记忆) 或 'formal' (模拟考试)
        const examQuestions = ref([]);
        const score = ref(0);
        const correctCount = ref(0);
        const wrongCount = ref(0);
        
        const examStarted = ref(false);
        const examFinished = ref(false);
        const currentQuestionIndex = ref(0);
        const currentRecipe = ref(null);
        
        const userSelections = ref([]);
        const currentIngredient = ref('');
        const showResult = ref(false);
        const isCorrect = ref(false);

        // 快速记忆 (无尽模式)
        const startMemory = () => {
            if (recipes.value.length === 0) return alert('配方库为空，请先添加配方！');
            examMode.value = 'memory';
            score.value = 0;
            correctCount.value = 0;
            wrongCount.value = 0;
            currentQuestionIndex.value = 0;
            examStarted.value = true;
            examFinished.value = false;
            generateRandomQuestion();
            currentTab.value = 'exam_view';
        };

        // 模拟考试 (20题 100分)
        const startFormalExam = () => {
            if (recipes.value.length === 0) return alert('配方库为空，请先添加配方！');
            examMode.value = 'formal';
            score.value = 0;
            correctCount.value = 0;
            wrongCount.value = 0;
            currentQuestionIndex.value = 0;
            
            // 随机生成20题
            const questions = [];
            for (let i = 0; i < 20; i++) {
                questions.push(recipes.value[Math.floor(Math.random() * recipes.value.length)]);
            }
            examQuestions.value = questions;
            currentRecipe.value = questions[0];
            
            examStarted.value = true;
            examFinished.value = false;
            userSelections.value = [];
            currentIngredient.value = '';
            showResult.value = false;
            currentTab.value = 'exam_view';
        };

        const generateRandomQuestion = () => {
            const randomIndex = Math.floor(Math.random() * recipes.value.length);
            currentRecipe.value = recipes.value[randomIndex];
            userSelections.value = [];
            currentIngredient.value = '';
            showResult.value = false;
        };

        const selectIngredient = (ing) => {
            currentIngredient.value = currentIngredient.value === ing ? '' : ing;
        };

        const selectAmount = (amt) => {
            if (currentIngredient.value && amt) {
                userSelections.value.push({
                    name: currentIngredient.value,
                    amount: amt
                });
                currentIngredient.value = '';
            }
        };

        const removeSelection = (index) => {
            userSelections.value.splice(index, 1);
        };

        const submitAnswer = () => {
            let correct = true;
            const expected = currentRecipe.value.ingredients;
            const actual = userSelections.value;
            
            if (expected.length !== actual.length) {
                correct = false;
            } else {
                for (let i = 0; i < expected.length; i++) {
                    if (expected[i].name !== actual[i].name || expected[i].amount !== actual[i].amount) {
                        correct = false;
                        break;
                    }
                }
            }
            
            isCorrect.value = correct;
            if (correct) {
                score.value += (examMode.value === 'formal' ? 5 : 10);
                correctCount.value++;
            } else {
                wrongCount.value++;
                addToMistakes(currentRecipe.value.id);
            }
            showResult.value = true;
        };

        const nextQuestion = () => {
            if (examMode.value === 'formal') {
                if (currentQuestionIndex.value >= 19) {
                    // 考完了
                    showResult.value = false;
                    examFinished.value = true;
                    
                    // 保存考试成绩到历史记录
                    examHistory.value.push({
                        date: new Date().toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                        score: score.value
                    });
                    localStorage.setItem('luckin_exam_history', JSON.stringify(examHistory.value));
                    
                } else {
                    currentQuestionIndex.value++;
                    currentRecipe.value = examQuestions.value[currentQuestionIndex.value];
                    userSelections.value = [];
                    currentIngredient.value = '';
                    showResult.value = false;
                }
            } else {
                currentQuestionIndex.value++;
                generateRandomQuestion();
            }
        };

        const resetExam = () => {
            if (examMode.value === 'formal') {
                if (confirm('考试还未结束，确定要提前交卷吗？未做的题目将不计分。')) {
                    // 提前交卷：显示结算页并保存当前成绩
                    showResult.value = false;
                    examFinished.value = true;
                    
                    examHistory.value.push({
                        date: new Date().toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                        score: score.value
                    });
                    localStorage.setItem('luckin_exam_history', JSON.stringify(examHistory.value));
                }
            } else {
                if (confirm('确定要退出本次练习吗？')) {
                    // 快速记忆模式：直接退出不记分
                    examStarted.value = false;
                    examFinished.value = false;
                    currentTab.value = 'home';
                }
            }
        };

        // --- 配方管理逻辑 (CRUD) ---
        const editingRecipe = ref(null);
        const isAddingNew = ref(false);

        const openAddRecipe = () => {
            editingRecipe.value = {
                id: Date.now(),
                name: '',
                type: '拿铁类',
                ingredients: [{ name: '', amount: '' }],
                notes: ''
            };
            isAddingNew.value = true;
            currentTab.value = 'manage_edit';
        };

        const openEditRecipe = (recipe) => {
            editingRecipe.value = JSON.parse(JSON.stringify(recipe)); // Deep copy
            isAddingNew.value = false;
            currentTab.value = 'manage_edit';
        };

        const saveRecipe = () => {
            if (!editingRecipe.value.name.trim()) return alert('请输入饮品名称！');
            // 清理空的配料
            editingRecipe.value.ingredients = editingRecipe.value.ingredients.filter(i => i.name.trim() && i.amount.trim());
            if (editingRecipe.value.ingredients.length === 0) return alert('请至少添加一种配料！');

            if (isAddingNew.value) {
                recipes.value.push(editingRecipe.value);
            } else {
                const idx = recipes.value.findIndex(r => r.id === editingRecipe.value.id);
                if (idx !== -1) recipes.value[idx] = editingRecipe.value;
            }
            currentTab.value = 'manage';
        };

        const deleteRecipe = (id) => {
            if (confirm('确定要永久删除这个配方吗？')) {
                recipes.value = recipes.value.filter(r => r.id !== id);
                // 同步清理错题本中的无效引用
                removeFromMistakes(id);
            }
        };

        const addIngredientToEdit = () => {
            editingRecipe.value.ingredients.push({ name: '', amount: '' });
        };

        const removeIngredientFromEdit = (idx) => {
            editingRecipe.value.ingredients.splice(idx, 1);
        };

        // --- 统计与图表逻辑 ---
        let chartInstance = null;
        
        // --- 摸鱼休息室逻辑 ---
        const relaxCount = ref(0);
        const sweetMessages = [
            "辛苦啦~休息一会 哦一泡~",
            "老婆真棒~来根小烟~",
            "喝口水~摸摸太子去~",
            "慢慢来，肌肉记忆需要时间~",
            "歇会儿~休息一下~Timi~~"
        ];
        const currentSweetMessage = ref(sweetMessages[0]);
        const floatingEmotes = ref([]);
        let emoteId = 0;

        const tapRelax = () => {
            relaxCount.value++;
            const id = emoteId++;
            // 随机改变鼓励语
            if (Math.random() > 0.6) {
                currentSweetMessage.value = sweetMessages[Math.floor(Math.random() * sweetMessages.length)];
            }
            // 添加漂浮动画元素
            floatingEmotes.value.push({ id, left: Math.random() * 60 + 20 });
            setTimeout(() => {
                floatingEmotes.value = floatingEmotes.value.filter(e => e.id !== id);
            }, 1000);
        };
        
        const avgScore = computed(() => {
            if (examHistory.value.length === 0) return 0;
            const sum = examHistory.value.reduce((acc, curr) => acc + curr.score, 0);
            return Math.round(sum / examHistory.value.length);
        });

        const openStats = () => {
            currentTab.value = 'stats';
            
            // 确保 DOM 渲染完成后再绘制图表
            nextTick(() => {
                const ctx = document.getElementById('scoreChart');
                if (!ctx) return;

                // 销毁旧图表实例（如果存在）
                if (chartInstance) {
                    chartInstance.destroy();
                }

                // 取最近 5 次成绩
                const recentHistory = examHistory.value.slice(-5);
                
                const labels = recentHistory.map((h, index) => `第${index + 1}次\n${h.date}`);
                const data = recentHistory.map(h => h.score);

                // 如果没有数据，提供默认展示数据
                if (recentHistory.length === 0) {
                    labels.push('暂无数据');
                    data.push(0);
                }

                chartInstance = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: '考试得分',
                            data: data,
                            borderColor: '#2563eb', // blue-600
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            borderWidth: 3,
                            pointBackgroundColor: '#ffffff',
                            pointBorderColor: '#2563eb',
                            pointBorderWidth: 2,
                            pointRadius: 5,
                            pointHoverRadius: 7,
                            fill: true,
                            tension: 0.3 // 曲线平滑度
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    title: (context) => {
                                        return context[0].label.replace('\n', ' ');
                                    },
                                    label: (context) => {
                                        return `得分: ${context.parsed.y} 分`;
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                min: 0,
                                max: 100,
                                ticks: {
                                    stepSize: 20
                                },
                                grid: {
                                    color: '#f3f4f6' // gray-100
                                }
                            },
                            x: {
                                grid: {
                                    display: false
                                },
                                ticks: {
                                    maxRotation: 0,
                                    callback: function(val, index) {
                                        // 只显示“第x次”，隐藏日期以节省空间
                                        return this.getLabelForValue(val).split('\n')[0];
                                    }
                                }
                            }
                        }
                    }
                });
            });
        };

        return {
            // 基础状态
            currentTab,
            recipes,
            
            // 配方库
            searchQuery,
            expandedRecipe,
            filteredRecipes,
            toggleRecipe,
            
            // 错题集
            mistakeRecipes,
            removeFromMistakes,
            
            // 统一考试/记忆
            examMode,
            score,
            correctCount,
            wrongCount,
            examStarted,
            examFinished,
            currentQuestionIndex,
            currentRecipe,
            userSelections,
            currentIngredient,
            availableIngredients,
            availableAmounts,
            showResult,
            isCorrect,
            startMemory,
            startFormalExam,
            selectIngredient,
            selectAmount,
            removeSelection,
            submitAnswer,
            nextQuestion,
            resetExam,

            // 配方管理
            editingRecipe,
            isAddingNew,
            openAddRecipe,
            openEditRecipe,
            saveRecipe,
            deleteRecipe,
            addIngredientToEdit,
            removeIngredientFromEdit,
            
            // 统计
            examHistory,
            avgScore,
            openStats,
            
            // 休息室
            relaxCount,
            currentSweetMessage,
            floatingEmotes,
            tapRelax
        };
    }
});

app.mount('#app');