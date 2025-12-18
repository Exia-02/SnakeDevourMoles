function SnakeDevourMoles() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.gridSize = 20;
    this.tileCount = this.canvas.width / this.gridSize;
    
    this.snake = [
        {x: 10, y: 10}
    ];
    this.direction = {x: 0, y: 0};
    this.nextDirection = {x: 0, y: 0};
    
    this.moles = [];
    this.score = 0;
    this.gameSpeed = 150;
    this.gameRunning = false;
    this.gamePaused = false;
    
    this.initializeGame();
    this.setupEventListeners();
}

SnakeDevourMoles.prototype.initializeGame = function() {
    this.snake = [{x: 10, y: 10}];
    this.direction = {x: 0, y: 0};
    this.nextDirection = {x: 0, y: 0};
    this.moles = [];
    this.score = 0;
    this.gameRunning = false;
    this.gamePaused = false;
    
    this.updateScore();
    this.draw();
};

SnakeDevourMoles.prototype.setupEventListeners = function() {
    var self = this;
    
    document.getElementById('startBtn').addEventListener('click', function() { self.startGame(); });
    document.getElementById('pauseBtn').addEventListener('click', function() { self.togglePause(); });
    document.getElementById('restartBtn').addEventListener('click', function() { self.restartGame(); });
    
    document.addEventListener('keydown', function(e) { self.handleKeyPress(e); });
    
    document.getElementById('startBtn').addEventListener('touchstart', function(e) { e.preventDefault(); self.startGame(); });
    document.getElementById('pauseBtn').addEventListener('touchstart', function(e) { e.preventDefault(); self.togglePause(); });
    document.getElementById('restartBtn').addEventListener('touchstart', function(e) { e.preventDefault(); self.restartGame(); });
    
    // 添加触摸滑动事件
    var touchStartX = 0;
    var touchStartY = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    });
    
    document.addEventListener('touchend', function(e) {
        if (!self.gameRunning || self.gamePaused) return;
        
        var touchEndX = e.changedTouches[0].clientX;
        var touchEndY = e.changedTouches[0].clientY;
        
        var deltaX = touchEndX - touchStartX;
        var deltaY = touchEndY - touchStartY;
        
        // 计算滑动方向
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 水平滑动
            if (deltaX > 20) {
                // 向右滑动
                if (self.direction.x === 0) self.nextDirection = {x: 1, y: 0};
            } else if (deltaX < -20) {
                // 向左滑动
                if (self.direction.x === 0) self.nextDirection = {x: -1, y: 0};
            }
        } else {
            // 垂直滑动
            if (deltaY > 20) {
                // 向下滑动
                if (self.direction.y === 0) self.nextDirection = {x: 0, y: 1};
            } else if (deltaY < -20) {
                // 向上滑动
                if (self.direction.y === 0) self.nextDirection = {x: 0, y: -1};
            }
        }
        
        e.preventDefault();
    });
    
    window.game = this;
    window.changeDirection = function(x, y) { self.changeDirection(x, y); };
    window.pauseGame = function() { self.togglePause(); };
    window.restartGame = function() { self.restartGame(); };
};

SnakeDevourMoles.prototype.startGame = function() {
    if (!this.gameRunning) {
        this.initializeGame();
        this.direction = {x: 0, y: -1};
        this.nextDirection = {x: 0, y: -1};
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameLoop();
        
        document.getElementById('gameOver').style.display = 'none';
    } else if (this.gamePaused) {
        this.togglePause();
    }
};

SnakeDevourMoles.prototype.togglePause = function() {
    if (this.gameRunning) {
        this.gamePaused = !this.gamePaused;
        document.getElementById('pauseBtn').textContent = this.gamePaused ? '继续' : '暂停';
        
        // 如果游戏从暂停状态切换到继续状态，重新启动gameLoop
        if (!this.gamePaused) {
            var self = this;
            setTimeout(function() { self.gameLoop(); }, self.gameSpeed);
        }
    }
};

SnakeDevourMoles.prototype.restartGame = function() {
    this.initializeGame();
    this.startGame();
};

SnakeDevourMoles.prototype.handleKeyPress = function(e) {
    if (!this.gameRunning || this.gamePaused) return;
    
    switch(e.key) {
        case 'ArrowUp':
            if (this.direction.y === 0) this.nextDirection = {x: 0, y: -1};
            break;
        case 'ArrowDown':
            if (this.direction.y === 0) this.nextDirection = {x: 0, y: 1};
            break;
        case 'ArrowLeft':
            if (this.direction.x === 0) this.nextDirection = {x: -1, y: 0};
            break;
        case 'ArrowRight':
            if (this.direction.x === 0) this.nextDirection = {x: 1, y: 0};
            break;
        case ' ':
            this.togglePause();
            break;
    }
};

SnakeDevourMoles.prototype.changeDirection = function(x, y) {
    if (!this.gameRunning || this.gamePaused) return;
    
    if (this.direction.x + x !== 0 || this.direction.y + y !== 0) {
        this.nextDirection = {x: x, y: y};
    }
};

SnakeDevourMoles.prototype.getEmptyTiles = function() {
    var occupied = [];
    var self = this;
    
    this.snake.forEach(function(segment) {
        occupied.push(segment.x + ',' + segment.y);
    });
    
    this.moles.forEach(function(mole) {
        occupied.push(mole.x + ',' + mole.y);
    });
    
    var emptyTiles = [];
    for (var x = 0; x < self.tileCount; x++) {
        for (var y = 0; y < self.tileCount; y++) {
            var tileKey = x + ',' + y;
            if (occupied.indexOf(tileKey) === -1) {
                emptyTiles.push({x: x, y: y});
            }
        }
    }
    
    return emptyTiles;
};

SnakeDevourMoles.prototype.getMinMoles = function() {
    var emptyTiles = this.getEmptyTiles();
    if (emptyTiles.length <= 2) {
        return 1;
    } else if (emptyTiles.length < 8) {
        return 2;
    } else {
        return Math.max(1, Math.floor(emptyTiles.length / 8));
    }
};

SnakeDevourMoles.prototype.getMaxMoles = function() {
    var emptyTiles = this.getEmptyTiles();
    if (emptyTiles.length <= 2) {
        return 1;
    } else if (emptyTiles.length < 8) {
        return 2;
    } else {
        return Math.min(Math.floor(emptyTiles.length / 8), 15);
    }
};

SnakeDevourMoles.prototype.getTilesNearSnakeHead = function(distance) {
    var head = this.snake[0];
    var nearTiles = [];
    var self = this;
    
    for (var dx = -distance; dx <= distance; dx++) {
        for (var dy = -distance; dy <= distance; dy++) {
            if (Math.abs(dx) + Math.abs(dy) <= distance) {
                var x = head.x + dx;
                var y = head.y + dy;
                
                if (x >= 0 && x < self.tileCount && y >= 0 && y < self.tileCount) {
                    var occupied = false;
                    for (var i = 0; i < self.snake.length; i++) {
                        var segment = self.snake[i];
                        if (segment.x === x && segment.y === y) {
                            occupied = true;
                            break;
                        }
                    }
                    for (var j = 0; j < self.moles.length; j++) {
                        var mole = self.moles[j];
                        if (mole.x === x && mole.y === y) {
                            occupied = true;
                            break;
                        }
                    }
                    
                    if (!occupied) {
                        nearTiles.push({x: x, y: y});
                    }
                }
            }
        }
    }
    
    return nearTiles;
};

SnakeDevourMoles.prototype.spawnMole = function() {
    if (!this.gameRunning || this.gamePaused) return;
    
    var minMoles = this.getMinMoles();
    var maxMoles = this.getMaxMoles();
    var self = this;
    
    if (this.moles.length < minMoles) {
        var emptyTiles = this.getEmptyTiles();
        if (emptyTiles.length > 0) {
            var randomIndex = Math.floor(Math.random() * emptyTiles.length);
            var randomTile = emptyTiles[randomIndex];
            this.createMole(randomTile.x, randomTile.y);
        }
    }
    
    var nearTiles = this.getTilesNearSnakeHead(5);
    var headX = this.snake[0].x;
    var headY = this.snake[0].y;
    
    var molesNearHead = [];
    for (var i = 0; i < this.moles.length; i++) {
        var mole = this.moles[i];
        if (Math.abs(mole.x - headX) + Math.abs(mole.y - headY) <= 5) {
            molesNearHead.push(mole);
        }
    }
    
    if (molesNearHead.length < 1 && nearTiles.length > 0) {
        var randomIndex = Math.floor(Math.random() * nearTiles.length);
        var randomTile = nearTiles[randomIndex];
        this.createMole(randomTile.x, randomTile.y);
    }
    
    if (this.moles.length < maxMoles && Math.random() < 0.3) {
        var emptyTiles = this.getEmptyTiles();
        if (emptyTiles.length > 0) {
            var randomIndex = Math.floor(Math.random() * emptyTiles.length);
            var randomTile = emptyTiles[randomIndex];
            this.createMole(randomTile.x, randomTile.y);
        }
    }
    
    this.updateMoleCount();
};

SnakeDevourMoles.prototype.createMole = function(x, y) {
    var lifetime = 1000 + Math.random() * 2000;
    var self = this;
    
    this.moles.push({
        x: x,
        y: y,
        lifetime: lifetime,
        spawnTime: Date.now(),
        timer: setTimeout(function() {
            self.removeMole(x, y);
        }, lifetime)
    });
};

SnakeDevourMoles.prototype.removeMole = function(x, y) {
    var moleIndex = -1;
    for (var i = 0; i < this.moles.length; i++) {
        if (this.moles[i].x === x && this.moles[i].y === y) {
            moleIndex = i;
            break;
        }
    }
    
    if (moleIndex !== -1) {
        clearTimeout(this.moles[moleIndex].timer);
        this.moles.splice(moleIndex, 1);
        this.updateMoleCount();
    }
};

SnakeDevourMoles.prototype.updateMoles = function() {
    var now = Date.now();
    var updatedMoles = [];
    
    for (var i = 0; i < this.moles.length; i++) {
        var mole = this.moles[i];
        if (now - mole.spawnTime >= mole.lifetime) {
            clearTimeout(mole.timer);
        } else {
            updatedMoles.push(mole);
        }
    }
    
    this.moles = updatedMoles;
};

SnakeDevourMoles.prototype.checkCollision = function() {
    var head = this.snake[0];
    
    if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
        return true;
    }
    
    for (var i = 1; i < this.snake.length; i++) {
        if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
            return true;
        }
    }
    
    return false;
};

SnakeDevourMoles.prototype.checkMoleCollision = function() {
    var head = this.snake[0];
    
    for (var i = 0; i < this.moles.length; i++) {
        if (head.x === this.moles[i].x && head.y === this.moles[i].y) {
            this.score += 10;
            this.removeMole(this.moles[i].x, this.moles[i].y);
            this.growSnake();
            
            if (this.gameSpeed > 50) {
                this.gameSpeed -= 2;
            }
            
            this.updateScore();
            return true;
        }
    }
    
    return false;
};

SnakeDevourMoles.prototype.growSnake = function() {
    var tail = this.snake[this.snake.length - 1];
    this.snake.push({x: tail.x, y: tail.y});
};

SnakeDevourMoles.prototype.moveSnake = function() {
    this.direction = {x: this.nextDirection.x, y: this.nextDirection.y};
    
    if (this.direction.x === 0 && this.direction.y === 0) return;
    
    var head = {x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y};
    
    this.snake.unshift(head);
    
    if (!this.checkMoleCollision()) {
        this.snake.pop();
    }
};

SnakeDevourMoles.prototype.updateScore = function() {
    document.getElementById('score').textContent = this.score;
};

SnakeDevourMoles.prototype.updateMoleCount = function() {
    document.getElementById('moleCount').textContent = this.moles.length;
    document.getElementById('maxMoles').textContent = this.getMaxMoles();
};

SnakeDevourMoles.prototype.draw = function() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.drawGrid();
    this.drawSnake();
    this.drawMoles();
};

SnakeDevourMoles.prototype.drawGrid = function() {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 0.5;
    
    for (var i = 0; i <= this.tileCount; i++) {
        this.ctx.beginPath();
        this.ctx.moveTo(i * this.gridSize, 0);
        this.ctx.lineTo(i * this.gridSize, this.canvas.height);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, i * this.gridSize);
        this.ctx.lineTo(this.canvas.width, i * this.gridSize);
        this.ctx.stroke();
    }
};

SnakeDevourMoles.prototype.drawSnake = function() {
    var self = this;
    this.snake.forEach(function(segment, index) {
        var x = segment.x * self.gridSize;
        var y = segment.y * self.gridSize;
        
        if (index === 0) {
            // 蛇头
            self.ctx.fillStyle = '#2E7D32';
            self.ctx.fillRect(x, y, self.gridSize, self.gridSize);
            
            self.ctx.fillStyle = '#4CAF50';
            self.ctx.fillRect(x + 1, y + 1, self.gridSize - 2, self.gridSize - 2);
            
            // 简单的眼睛
            self.ctx.fillStyle = '#000000';
            self.ctx.fillRect(x + 4, y + 4, 3, 3);
            self.ctx.fillRect(x + 13, y + 4, 3, 3);
        } else {
            // 蛇身
            self.ctx.fillStyle = '#1976D2';
            self.ctx.fillRect(x, y, self.gridSize, self.gridSize);
            
            self.ctx.fillStyle = '#1565C0';
            self.ctx.fillRect(x + 2, y + 2, self.gridSize - 4, self.gridSize - 4);
        }
    });
};

SnakeDevourMoles.prototype.drawMoles = function() {
    var self = this;
    this.moles.forEach(function(mole) {
        var x = mole.x * self.gridSize;
        var y = mole.y * self.gridSize;
        
        self.ctx.fillStyle = '#8B4513';
        self.ctx.fillRect(x, y, self.gridSize, self.gridSize);
        
        self.ctx.fillStyle = '#A0522D';
        self.ctx.fillRect(x + 2, y + 2, self.gridSize - 4, self.gridSize - 4);
        
        // 简单的眼睛
        self.ctx.fillStyle = '#000000';
        self.ctx.fillRect(x + 5, y + 5, 3, 3);
        self.ctx.fillRect(x + 12, y + 5, 3, 3);
        
        // 简单的鼻子
        self.ctx.fillStyle = '#FF6B6B';
        self.ctx.fillRect(x + 9, y + 8, 2, 2);
    });
};

SnakeDevourMoles.prototype.gameOver = function() {
    this.gameRunning = false;
    
    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('gameOver').style.display = 'block';
    
    for (var i = 0; i < this.moles.length; i++) {
        clearTimeout(this.moles[i].timer);
    }
    this.moles = [];
};

SnakeDevourMoles.prototype.gameLoop = function() {
    if (!this.gameRunning || this.gamePaused) return;
    
    this.moveSnake();
    
    if (this.checkCollision()) {
        this.gameOver();
        return;
    }
    
    this.updateMoles();
    
    this.spawnMole();
    
    this.draw();
    
    var self = this;
    setTimeout(function() { self.gameLoop(); }, self.gameSpeed);
};

document.addEventListener('DOMContentLoaded', function() {
    new SnakeDevourMoles();
});