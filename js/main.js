// 配置
const DEEPSEEK_API_KEY = 'sk-941680d6391c4e0fa034ac073b236925';

// 验证码检查
class VerificationManager {
    constructor() {
        this.modal = document.getElementById('verificationModal');
        this.verifyBtn = document.getElementById('verifyBtn');
        this.codeInput = document.getElementById('verificationCode');
        this.correctCode = 'cy.waryts.com';
        this.isVerified = false;
        
        this.init();
    }
    
    init() {
        // 检查本地存储中的验证状态
        this.isVerified = localStorage.getItem('isVerified') === 'true';
        if (!this.isVerified) {
            this.showModal();
        } else {
            this.hideModal();
        }
        
        this.verifyBtn.addEventListener('click', () => this.verify());
        this.codeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.verify();
            }
        });
    }
    
    showModal() {
        this.modal.style.display = 'flex';
        this.codeInput.focus();
    }
    
    hideModal() {
        this.modal.style.display = 'none';
    }
    
    verify() {
        const code = this.codeInput.value.trim().toLowerCase();
        if (code === this.correctCode) {
            this.isVerified = true;
            localStorage.setItem('isVerified', 'true');
            this.hideModal();
            
            // 添加成功动画
            this.verifyBtn.classList.add('success');
            setTimeout(() => {
                this.verifyBtn.classList.remove('success');
            }, 1000);
        } else {
            // 显示错误动画
            this.codeInput.classList.add('error');
            this.verifyBtn.classList.add('error');
            
            // 创建错误提示
            let errorMsg = this.modal.querySelector('.verification-error');
            if (!errorMsg) {
                errorMsg = document.createElement('p');
                errorMsg.className = 'verification-error';
                this.modal.querySelector('.verification-body').appendChild(errorMsg);
            }
            errorMsg.textContent = '验证码错误，请重试';
            errorMsg.style.display = 'block';
            
            // 清除错误状态
            setTimeout(() => {
                this.codeInput.classList.remove('error');
                this.verifyBtn.classList.remove('error');
                errorMsg.style.display = 'none';
            }, 2000);
            
            this.codeInput.value = '';
            this.codeInput.focus();
        }
    }
}

class AudioVisualizer {
    constructor() {
        this.canvas = document.getElementById('visualizer');
        this.ctx = this.canvas.getContext('2d');
        this.isPlaying = false;
        this.animationId = null;
        this.wavePoints = [];
        this.init();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.generateWavePoints();
    }

    generateWavePoints() {
        const totalPoints = 128; // 波形点数
        this.wavePoints = new Array(totalPoints).fill(0);
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    connectToSpeech(utterance) {
        // 由于 Web Speech API 不提供音频数据，我们使用模拟的波形
        utterance.onstart = () => {
            this.startVisualization();
        };
        
        utterance.onend = () => {
            this.stopVisualization();
        };
        
        utterance.onpause = () => {
            this.stopVisualization();
        };
        
        utterance.onresume = () => {
            this.startVisualization();
        };
    }

    startVisualization() {
        this.isPlaying = true;
        this.draw();
    }

    stopVisualization() {
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw() {
        if (!this.isPlaying) return;

        this.animationId = requestAnimationFrame(() => this.draw());
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 更新波形点的值
        for (let i = 0; i < this.wavePoints.length; i++) {
            // 使用正弦函数生成平滑的波形
            const time = Date.now() / 1000;
            const frequency = 2 + Math.sin(time * 0.5) * 1.5;
            const amplitude = 0.3 + Math.sin(time * 0.2) * 0.1;
            this.wavePoints[i] = Math.sin(time * frequency + i * 0.2) * amplitude;
        }

        // 绘制波形
        const barWidth = this.canvas.width / this.wavePoints.length;
        const centerY = this.canvas.height / 2;

        this.ctx.beginPath();
        this.ctx.moveTo(0, centerY);

        // 绘制主波形
        for (let i = 0; i < this.wavePoints.length; i++) {
            const x = i * barWidth;
            const y = centerY + this.wavePoints[i] * centerY;
            
            // 使用二次贝塞尔曲线使波形更平滑
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                const xc = (x + (i - 1) * barWidth) / 2;
                const yc = (y + centerY + this.wavePoints[i-1] * centerY) / 2;
                this.ctx.quadraticCurveTo(x-barWidth, centerY + this.wavePoints[i-1] * centerY, xc, yc);
            }
        }

        // 设置波形样式
        this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // 添加发光效果
        this.ctx.shadowColor = 'rgba(0, 243, 255, 0.5)';
        this.ctx.shadowBlur = 10;
        this.ctx.stroke();

        // 绘制镜像波形（较淡）
        this.ctx.beginPath();
        for (let i = 0; i < this.wavePoints.length; i++) {
            const x = i * barWidth;
            const y = centerY - this.wavePoints[i] * centerY;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                const xc = (x + (i - 1) * barWidth) / 2;
                const yc = (y + centerY - this.wavePoints[i-1] * centerY) / 2;
                this.ctx.quadraticCurveTo(x-barWidth, centerY - this.wavePoints[i-1] * centerY, xc, yc);
            }
        }

        this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
        this.ctx.stroke();
    }
}

class PodcastApp {
    constructor() {
        this.userInput = document.getElementById('userInput');
        this.generateBtn = document.getElementById('generateBtn');
        this.audio = document.getElementById('audio');
        this.transcript = document.getElementById('transcript');
        this.durationSelect = document.getElementById('duration');
        this.customDuration = document.getElementById('customDuration');
        this.styleSelect = document.getElementById('style');
        this.currentTimeSpan = document.getElementById('currentTime');
        this.totalDurationSpan = document.getElementById('totalDuration');
        
        // 语音控制相关元素
        this.voiceSelect = document.getElementById('voiceSelect');
        this.speedControl = document.getElementById('speed');
        this.pitchControl = document.getElementById('pitch');
        this.emotionControl = document.getElementById('emotion');
        
        this.isGenerating = false;
        this.fullContent = '';
        
        // 添加可视化器
        this.visualizer = new AudioVisualizer();
        
        this.statusSpan = document.querySelector('.status-ready');
        
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.playIcon = this.playPauseBtn.querySelector('.play-icon');
        this.isPlaying = false;
        
        this.currentSentenceIndex = 0;
        this.sentences = [];
        this.isSpeaking = false;
        this.isPaused = false;
        
        this.startTime = 0;
        this.elapsedTime = 0;
        this.timeUpdateInterval = null;
        
        this.init();
    }
    
    init() {
        this.generateBtn.addEventListener('click', () => this.generatePodcast());
        this.durationSelect.addEventListener('change', () => this.handleDurationChange());
        this.audio.addEventListener('timeupdate', () => this.updateTimeDisplay());
        
        // 初始化语音合成
        this.synth = window.speechSynthesis;
        this.voices = [];
        
        // 等待声音加载
        speechSynthesis.addEventListener('voiceschanged', () => {
            this.voices = this.synth.getVoices().filter(voice => voice.lang.startsWith('zh'));
            this.updateVoiceList();
        });
        
        // 添加语音参数控制事件监听
        this.initVoiceControls();
        
        // 添加播放控制事件监听
        this.playPauseBtn.addEventListener('click', () => this.togglePlay());
        
        // 音频事件监听
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.playIcon.textContent = '⏸';
            this.playPauseBtn.classList.add('playing');
            this.updateStatus('播放中');
        });
        
        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.playIcon.textContent = '▶';
            this.playPauseBtn.classList.remove('playing');
            this.updateStatus('就绪');
        });
        
        this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.playIcon.textContent = '▶';
            this.playPauseBtn.classList.remove('playing');
            this.updateStatus('就绪');
        });
        
        // 更新时间显示
        this.audio.addEventListener('timeupdate', () => {
            this.updateTimeDisplay();
        });
    }
    
    initVoiceControls() {
        // 更新参数显示值
        const updateParamValue = (control) => {
            const valueSpan = control.parentElement.querySelector('.param-value');
            valueSpan.textContent = control.value;
        };
        
        [this.speedControl, this.pitchControl, this.emotionControl].forEach(control => {
            control.addEventListener('input', () => updateParamValue(control));
        });
    }
    
    updateVoiceList() {
        // 清空现有选项
        this.voiceSelect.innerHTML = '';
        
        // 添加可用的中文语音
        this.voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            this.voiceSelect.appendChild(option);
        });
        
        // 如果没有中文语音，添加提示
        if (this.voices.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = '未检测到中文语音';
            this.voiceSelect.appendChild(option);
        }
    }
    
    handleDurationChange() {
        const isCustom = this.durationSelect.value === 'custom';
        this.customDuration.style.display = isCustom ? 'inline-block' : 'none';
        
        if (isCustom) {
            // 添加提示信息
            const tipDiv = document.createElement('div');
            tipDiv.className = 'duration-tip';
            tipDiv.textContent = '注意：较长时间的内容会被自动分段生成，以确保质量';
            this.customDuration.parentElement.appendChild(tipDiv);
        } else {
            const existingTip = this.customDuration.parentElement.querySelector('.duration-tip');
            if (existingTip) {
                existingTip.remove();
            }
        }
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    updateTimeDisplay() {
        const currentTime = this.formatTime(this.elapsedTime / 1000);
        this.currentTimeSpan.textContent = currentTime;
    }
    
    getDuration() {
        if (this.durationSelect.value === 'custom') {
            const customValue = parseInt(this.customDuration.value);
            // 限制最大时长为60分钟
            if (customValue > 60) {
                alert('为确保内容质量，单次生成最大时长限制为60分钟');
                return 60;
            }
            return customValue > 0 ? customValue : 5;
        }
        return parseInt(this.durationSelect.value);
    }
    
    calculateSegments(duration) {
        // 根据时长智能计算分段
        if (duration <= 5) {
            return 1; // 5分钟以内不分段
        } else if (duration <= 15) {
            return Math.ceil(duration / 4); // 15分钟以内，每段4分钟
        } else if (duration <= 30) {
            return Math.ceil(duration / 5); // 30分钟以内，每段5分钟
        } else {
            return Math.ceil(duration / 6); // 30分钟以上，每段6分钟
        }
    }
    
    updateStatus(status, isError = false) {
        this.statusSpan.textContent = status;
        this.statusSpan.className = isError ? 'status-error' : 
                                   status === '播放中' ? 'status-playing' :
                                   status === '生成中' ? 'status-generating' :
                                   'status-ready';
    }
    
    async generatePodcast() {
        try {
            if (this.isGenerating) {
                alert('正在生成内容，请稍候...');
                return;
            }

            this.isGenerating = true;
            this.generateBtn.disabled = true;
            this.generateBtn.textContent = '生成中...';
            this.updateStatus('生成中');
            this.transcript.innerHTML = '';
            this.fullContent = '';
            
            const userPrompt = this.userInput.value.trim();
            if (!userPrompt) {
                alert('请输入要讨论的话题');
                return;
            }
            
            const duration = this.getDuration();
            const style = this.styleSelect.value;
            
            // 使用新的分段计算方法
            const segmentCount = this.calculateSegments(duration);
            let currentSegment = 1;
            
            // 显示生成进度和预计时间
            const progressDiv = document.createElement('div');
            progressDiv.className = 'generation-progress';
            const estimatedTime = Math.ceil(segmentCount * 1.5); // 预计每段生成需要1.5分钟
            progressDiv.innerHTML = `
                <div>正在生成第 ${currentSegment}/${segmentCount} 部分...</div>
                <div class="estimate-time">预计总用时：${estimatedTime} 分钟</div>
            `;
            this.transcript.appendChild(progressDiv);
            
            while (currentSegment <= segmentCount) {
                const startTime = Date.now();
                
                // 计算当前段落的目标时长
                const segmentDuration = Math.ceil(duration / segmentCount);
                
                // 生成当前段落
                const segmentContent = await this.generateSegment(
                    userPrompt,
                    style,
                    currentSegment,
                    segmentCount,
                    segmentDuration
                );
                
                // 添加到完整内容
                this.fullContent += segmentContent + '\n\n';
                
                // 更新显示和进度
                this.transcript.innerHTML = this.fullContent;
                const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
                progressDiv.innerHTML = `
                    <div>正在生成第 ${currentSegment + 1}/${segmentCount} 部分...</div>
                    <div class="estimate-time">上一部分用时：${elapsedTime} 秒</div>
                    <div class="estimate-time">预计剩余时间：${Math.ceil((segmentCount - currentSegment) * 1.5)} 分钟</div>
                `;
                
                currentSegment++;
                
                // 添加短暂延迟，避免API限制
                if (currentSegment <= segmentCount) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
            
            // 移除进度显示
            progressDiv.remove();
            
            // 更新状态为播放中
            this.updateStatus('播放中');
            this.generateBtn.textContent = '重新生成';
            
            // 将文字转换为语音
            await this.generateSpeech(this.fullContent);
            
        } catch (error) {
            console.error('生成播客内容时出错:', error);
            alert('生成内容时发生错误，请稍后重试');
            this.updateStatus('错误', true);
        } finally {
            this.isGenerating = false;
            this.generateBtn.disabled = false;
        }
    }
    
    async generateSegment(prompt, style, currentSegment, totalSegments, segmentDuration) {
        const stylePrompts = {
            academic: '以学术研究的严谨口吻',
            professional: '以专业和严谨的口吻',
            news: '以新闻播报的客观口吻',
            documentary: '以纪录片旁白的深沉口吻',
            educational: '以通俗易懂的教学口吻',
            children: '以生动活泼的儿童教育口吻',
            tutorial: '以循序渐进的教程指导口吻',
            storytelling: '以生动的故事叙述方式',
            casual: '以轻松随意的聊天口吻',
            comedy: '以幽默诙谐的方式',
            drama: '以富有戏剧性的表现方式',
            emotional: '以感性抒情的方式',
            motivational: '以充满激情的激励方式',
            meditation: '以平和舒缓的冥想引导方式'
        };

        let segmentPrompt;
        if (totalSegments === 1) {
            segmentPrompt = `请${stylePrompts[style]}，围绕主题"${prompt}"进行约${segmentDuration}分钟的播客演讲。`;
        } else {
            if (currentSegment === 1) {
                segmentPrompt = `这是一个分${totalSegments}部分的播客内容的第1部分，每部分约${segmentDuration}分钟。请${stylePrompts[style]}，为主题"${prompt}"开场并开始讨论第一部分内容。`;
            } else if (currentSegment === totalSegments) {
                segmentPrompt = `这是播客的最后一部分（约${segmentDuration}分钟）。请${stylePrompts[style]}，总结主题"${prompt}"的讨论并进行结尾。要求与之前的内容自然衔接。`;
            } else {
                segmentPrompt = `这是播客的第${currentSegment}部分（约${segmentDuration}分钟）。请${stylePrompts[style]}，继续围绕主题"${prompt}"进行讨论，要求与上下文自然衔接。`;
            }
        }
        
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "user",
                        content: segmentPrompt
                    }
                ],
                temperature: 0.7
            })
        });
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    async generateSpeech(text) {
        // 停止之前的语音播放
        this.synth.cancel();
        this.fullContent = text;
        this.startSpeech();
    }
    
    togglePlay() {
        if (this.isSpeaking) {
            if (this.isPaused) {
                this.resumeSpeech();
            } else {
                this.pauseSpeech();
            }
        } else if (this.fullContent) {
            this.startSpeech();
        }
    }

    pauseSpeech() {
        this.isPaused = true;
        this.isSpeaking = false;
        this.synth.cancel();
        this.playIcon.textContent = '▶';
        this.playPauseBtn.classList.remove('playing');
        this.updateStatus('就绪');
        this.stopTimeUpdate();
        this.visualizer.stopVisualization();
        
        // 保存当前句子的索引，以便恢复时从正确的位置继续
        this.pausedIndex = this.currentSentenceIndex;
    }

    resumeSpeech() {
        this.isPaused = false;
        this.isSpeaking = true;
        // 从暂停的位置继续播放
        this.currentSentenceIndex = this.pausedIndex;
        this.playIcon.textContent = '⏸';
        this.playPauseBtn.classList.add('playing');
        this.updateStatus('播放中');
        this.startTimeUpdate();
        this.speakCurrentSentence();
    }

    startSpeech() {
        this.sentences = this.fullContent.match(/[^。！？.!?]+[。！？.!?]+/g) || [this.fullContent];
        this.currentSentenceIndex = 0;
        this.isSpeaking = true;
        this.isPaused = false;
        this.elapsedTime = 0;
        this.playIcon.textContent = '⏸';
        this.playPauseBtn.classList.add('playing');
        this.updateStatus('播放中');
        this.startTimeUpdate();
        this.speakCurrentSentence();
    }

    startTimeUpdate() {
        this.startTime = Date.now() - this.elapsedTime;
        this.timeUpdateInterval = setInterval(() => {
            if (this.isSpeaking && !this.isPaused) {
                this.elapsedTime = Date.now() - this.startTime;
                this.updateTimeDisplay();
            }
        }, 100);
    }

    stopTimeUpdate() {
        if (this.timeUpdateInterval) {
            clearInterval(this.timeUpdateInterval);
            this.timeUpdateInterval = null;
        }
    }

    async speakCurrentSentence() {
        if (!this.isSpeaking || this.isPaused) return;

        if (this.currentSentenceIndex >= this.sentences.length) {
            this.isSpeaking = false;
            this.isPaused = false;
            this.playIcon.textContent = '▶';
            this.playPauseBtn.classList.remove('playing');
            this.updateStatus('就绪');
            this.stopTimeUpdate();
            this.elapsedTime = 0;
            this.updateTimeDisplay();
            this.visualizer.stopVisualization();
            return;
        }

        const sentence = this.sentences[this.currentSentenceIndex];
        const utterance = new SpeechSynthesisUtterance(sentence);
        
        // 获取语音参数
        const speed = parseFloat(this.speedControl.value);
        const pitch = parseFloat(this.pitchControl.value);
        const emotion = parseInt(this.emotionControl.value) / 100;
        
        // 设置语音参数
        const selectedVoice = this.voices.find(voice => voice.name === this.voiceSelect.value);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        
        utterance.lang = 'zh-CN';
        utterance.rate = speed * (1 + emotion * 0.1);
        utterance.pitch = pitch * (1 + emotion * 0.2);
        
        // 根据标点符号调整语气
        if (sentence.endsWith('！')) {
            utterance.pitch *= 1.2;
            utterance.rate *= 1.1;
        } else if (sentence.endsWith('？')) {
            utterance.pitch *= 1.1;
        } else if (sentence.endsWith('。')) {
            utterance.pitch *= 0.9;
        }

        // 连接到音频可视化器
        this.visualizer.connectToSpeech(utterance);
        this.visualizer.startVisualization();

        // 设置回调
        utterance.onend = () => {
            if (this.isSpeaking && !this.isPaused) {
                this.currentSentenceIndex++;
                this.speakCurrentSentence();
            }
        };

        this.synth.speak(utterance);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new VerificationManager();
    new PodcastApp();
}); 