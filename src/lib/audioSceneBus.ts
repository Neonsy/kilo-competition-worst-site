'use client';

export type AudioScene = 'certificate';

export interface AudioSceneLockDetail {
  scene: AudioScene;
}

export interface AudioSceneReleaseDetail {
  scene: AudioScene;
  resumeQueueFromNext: boolean;
}

export const AUDIO_SCENE_LOCK_EVENT = 'mobd:audio-scene-lock';
export const AUDIO_SCENE_RELEASE_EVENT = 'mobd:audio-scene-release';

export function dispatchAudioSceneLock(detail: AudioSceneLockDetail) {
  window.dispatchEvent(
    new CustomEvent<AudioSceneLockDetail>(AUDIO_SCENE_LOCK_EVENT, {
      detail,
    })
  );
}

export function dispatchAudioSceneRelease(detail: AudioSceneReleaseDetail) {
  window.dispatchEvent(
    new CustomEvent<AudioSceneReleaseDetail>(AUDIO_SCENE_RELEASE_EVENT, {
      detail,
    })
  );
}
