import pygame

class Background(pygame.sprite.Sprite):
    def __init__(self, zoom=8.0):
        super().__init__()
        # Используем правильное имя файла
        self.image = pygame.image.load("assets/background.jpg").convert_alpha()
        w = int(self.image.get_width() * zoom)
        h = int(self.image.get_height() * zoom)
        self.image = pygame.transform.scale(self.image, (w, h))
        self.rect = self.image.get_rect(topleft=(0, 0))

    def draw(self, surface, camera_x, camera_y):
        surface.blit(self.image, (self.rect.x - camera_x, self.rect.y - camera_y))