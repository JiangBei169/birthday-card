class Firework {
    constructor() {
        this.canvas = document.getElementById('fireworks');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.createFireworkInterval = setInterval(() => this.createRandomFirework(), 800);
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createRandomFirework() {
        const x = Math.random() * this.canvas.width;
        const y = this.canvas.height + 10;
        const targetY = Math.random() * (this.canvas.height * 0.5);
        this.createFirework(x, y, x, targetY);
    }

    createFirework(x, y, targetX, targetY) {
        const particles = [];
        const particleCount = 150;
        const angle = Math.atan2(targetY - y, targetX - x);
        const speed = 8;
        const velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };

        particles.push({
            x, y,
            targetX, targetY,
            velocity,
            type: 'launcher',
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            life: 1
        });

        this.particles.push(...particles);
    }

    explode(x, y) {
        const particles = [];
        const particleCount = 150;
        const angleIncrement = (Math.PI * 2) / particleCount;

        for (let i = 0; i < particleCount; i++) {
            const angle = angleIncrement * i;
            const speed = 3 + Math.random() * 3;
            particles.push({
                x, y,
                velocity: {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed
                },
                type: 'explosion',
                color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                life: 1,
                size: 3
            });
        }

        this.particles.push(...particles);
    }

    animate() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((particle, index) => {
            if (particle.type === 'launcher') {
                particle.x += particle.velocity.x;
                particle.y += particle.velocity.y;
                particle.velocity.y += 0.1;

                if (Math.abs(particle.x - particle.targetX) < 5 && 
                    Math.abs(particle.y - particle.targetY) < 5) {
                    this.explode(particle.x, particle.y);
                    this.particles.splice(index, 1);
                }
            } else {
                particle.x += particle.velocity.x;
                particle.y += particle.velocity.y;
                particle.velocity.y += 0.1;
                particle.life -= 0.02;

                if (particle.life <= 0) {
                    this.particles.splice(index, 1);
                    return;
                }

                this.ctx.fillStyle = particle.color;
                this.ctx.globalAlpha = particle.life;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.globalAlpha = 1;
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

window.onload = () => new Firework();
