class Firework {
    constructor() {
        this.canvas = document.getElementById('fireworks');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles(x, y) {
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 * i) / 30;
            const velocity = 4;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * velocity * (0.5 + Math.random()),
                vy: Math.sin(angle) * velocity * (0.5 + Math.random()),
                life: 100,
                color: `hsl(${Math.random() * 360}, 50%, 50%)`
            });
        }
    }

    animate() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (Math.random() < 0.05) {
            this.createParticles(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height
            );
        }

        this.particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1;
            particle.life--;

            if (particle.life <= 0) {
                this.particles.splice(index, 1);
                return;
            }

            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.animate());
    }
}

window.onload = () => new Firework();
