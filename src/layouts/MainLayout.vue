<template>
  <q-layout view="lHh Lpr lFf">
    <q-drawer v-model="drawerOpen" :width="232" side="left" bordered class="qo-sidebar">
      <!-- Brand -->
      <div class="brand row items-center no-wrap">
        <div class="brand-mark">Q1</div>
        <div class="brand-text">
          <div class="brand-quest">QUEST</div>
          <div class="brand-one">ONE</div>
        </div>
      </div>

      <div class="nav-label">Workspace</div>

      <q-list class="qo-nav">
        <q-item
          v-for="item in items"
          :key="item.key"
          clickable
          class="qo-nav-item"
          :active="view === item.key"
          active-class="qo-nav-active"
          @click="view = item.key"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" size="22px" />
          </q-item-section>
          <q-item-section class="text-weight-medium">{{ item.label }}</q-item-section>
        </q-item>
      </q-list>

      <div class="sidebar-foot qo-muted">
        <q-icon name="bolt" size="16px" /> Demo · local only
      </div>
    </q-drawer>

    <q-page-container>
      <q-page class="qo-page column no-wrap">
        <!-- Slim header -->
        <header class="qo-topbar row items-center no-wrap">
          <q-btn
            flat
            round
            dense
            :icon="drawerOpen ? 'menu_open' : 'menu'"
            class="qo-toggle"
            aria-label="Toggle sidebar"
            @click="drawerOpen = !drawerOpen"
          />
          <div class="col">
            <div class="topbar-title">{{ titles[view] }}</div>
            <div class="topbar-sub qo-muted">Project landscape mapper</div>
          </div>
          <q-chip square class="project-chip" icon="folder_open">
            {{ store.project.name }}
          </q-chip>
        </header>

        <!-- Views -->
        <div class="qo-content col">
          <EditorPage v-show="view === 'editor'" />
          <AdminPage v-if="view === 'admin'" />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EditorPage from '@/pages/EditorPage.vue'
import AdminPage from '@/pages/AdminPage.vue'
import { useLandscapeStore } from '@/stores/landscape'

type ViewKey = 'editor' | 'admin'

const store = useLandscapeStore()
const view = ref<ViewKey>('editor')
const drawerOpen = ref(true)

const items: { key: ViewKey; label: string; icon: string }[] = [
  { key: 'editor', label: 'Editor', icon: 'map' },
  { key: 'admin', label: 'Admin', icon: 'tune' },
]
const titles: Record<ViewKey, string> = {
  editor: 'Landscape Editor',
  admin: 'Configuration',
}
</script>

<style scoped>
.qo-sidebar {
  background: var(--surface);
  border-right: 1px solid var(--border);
}
.brand {
  padding: 20px 18px 14px;
  gap: 12px;
}
.brand-mark {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: var(--pine);
  color: #fff;
  font-weight: 800;
  font-size: 15px;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}
.brand-text {
  line-height: 1.02;
}
.brand-quest,
.brand-one {
  font-weight: 800;
  font-size: 17px;
  letter-spacing: 2px;
  color: var(--pine);
}
.brand-one {
  color: var(--pine-dark);
}
.nav-label {
  padding: 10px 22px 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--muted);
}
.qo-nav {
  padding: 2px 8px;
}
.qo-nav-item {
  border-radius: 10px;
  margin: 3px 4px;
  min-height: 46px;
  color: var(--text);
}
.qo-nav-item :deep(.q-item__section--avatar) {
  min-width: 38px;
  color: var(--muted);
}
.qo-nav-active {
  background: var(--pine);
  color: #fff;
}
.qo-nav-active :deep(.q-icon) {
  color: #fff;
}
.sidebar-foot {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 14px 20px;
  font-size: 12px;
  border-top: 1px solid var(--border);
}
.qo-page {
  height: 100vh;
}
.qo-topbar {
  height: 64px;
  flex: 0 0 auto;
  padding: 0 22px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  gap: 12px;
}
.qo-toggle {
  color: var(--muted);
  margin-right: 6px;
}
.topbar-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}
.topbar-sub {
  font-size: 12px;
  margin-top: 1px;
}
.project-chip {
  background: var(--pine-tint);
  color: var(--pine-dark);
  font-weight: 600;
  border-radius: 9px;
}
.qo-content {
  position: relative;
  min-height: 0;
}
</style>
