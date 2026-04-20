import pygame
import math


class Car(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.original_image = pygame.image.load('assets/car.jpg').convert()
        # Удаляем фон у картинки машины
        color_of_bg = self.original_image.get_at((0, 0))
        self.original_image.set_colorkey(color_of_bg)

        zoom = 3
        w = int(self.original_image.get_width() / zoom)
        h = int(self.original_image.get_height() / zoom)
        self.original_image = pygame.transform.scale(self.original_image, (w, h))

        self.image = self.original_image
        self.rect = self.image.get_rect(center=(x, y))

        self.world_x = float(x)
        self.world_y = float(y)
        self.angle = 0
        self.speed = 0

        self.max_speed = 15
        self.acceleration = 0.2
        self.friction = 0.05
        self.rotation_speed = 3

    def update(self, keys):
        if keys[pygame.K_w]:
            self.speed += self.acceleration
        elif keys[pygame.K_s]:
            self.speed -= self.acceleration
        else:
            if self.speed > 0:
                self.speed = max(0, self.speed - self.friction)
            elif self.speed < 0:
                self.speed = min(0, self.speed + self.friction)

        self.speed = max(-self.max_speed / 2, min(self.speed, self.max_speed))

        if self.speed != 0:
            direction = 1 if self.speed > 0 else -1
            if keys[pygame.K_a]:
                self.angle += self.rotation_speed * direction
            if keys[pygame.K_d]:
                self.angle -= self.rotation_speed * direction

        self.angle %= 360
        self.image = pygame.transform.rotate(self.original_image, self.angle)
        self.rect = self.image.get_rect(center=(int(self.world_x), int(self.world_y)))

        radians = math.radians(self.angle)
        dx = math.cos(radians) * self.speed
        dy = -math.sin(radians) * self.speed

        return dx, dy

    def move(self, dx, dy):
        self.world_x += dx
        self.world_y += dy
        self.rect.center = (int(self.world_x), int(self.world_y))

    def draw(self, surface, camera_x, camera_y):
        draw_rect = self.rect.copy()
        draw_rect.x -= camera_x
        draw_rect.y -= camera_y
        surface.blit(self.image, draw_rect)