// Nazwa pliku: particles.cpp
#include <emscripten/bind.h>
#include <vector>
#include <cmath>
#include <algorithm>

struct Particle {
    float x, y, vx, vy, life, r, g, b;
};

std::vector<Particle> particles;

void spawnExplosion(float centerX, float centerY, int count) {
    for (int i = 0; i < count; ++i) {
        float angle = 2 * M_PI * i / count;
        float speed = 2 + rand() % 5;
        Particle p;
        p.x = centerX;
        p.y = centerY;
        p.vx = cos(angle) * speed;
        p.vy = sin(angle) * speed;
        p.life = 1.0;
        p.r = 1.0; p.g = 0.5 + (rand()%20)/40.0; p.b = 0.3;
        particles.push_back(p);
    }
}

emscripten::val getParticles() {
    emscripten::val arr = emscripten::val::array();
    for(size_t i = 0; i < particles.size(); i++){
        arr.set(i, emscripten::val::array({
            particles[i].x,
            particles[i].y,
            particles[i].life,
            particles[i].r,
            particles[i].g,
            particles[i].b
        }));
    }
    return arr;
}

void updateParticles(float dt) {
    for(auto &p : particles){
        p.x += p.vx*dt*60;
        p.y += p.vy*dt*60;
        p.life -= dt*0.8;
    }
    particles.erase(
      std::remove_if(particles.begin(), particles.end(), [](Particle &p){ return p.life <= 0; }),
      particles.end()
    );
}

EMSCRIPTEN_BINDINGS(particles_module) {
    emscripten::function("spawnExplosion", &spawnExplosion);
    emscripten::function("getParticles", &getParticles);
    emscripten::function("updateParticles", &updateParticles);
}
