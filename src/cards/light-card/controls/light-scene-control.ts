import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant, isAvailable } from "../../../ha";

@customElement("mushroom-light-scene-control")
export class MushroomLightSceneControl extends LitElement {
  // The Home Assistant instance
  @property({ attribute: false }) public hass!: HomeAssistant;

  // The select entity controlling scenes (e.g., select.hallway_light_1_scene)
  @property({ attribute: false }) public sceneEntity!: any;

  // The corresponding light entity to track state (optional)
  @property({ attribute: false }) public lightEntity?: any;

  onChange(e: CustomEvent<{ value: string }>) {
    const value = e.detail.value;
    if (!this.sceneEntity) return;

    this.hass.callService("select", "select_option", {
      entity_id: this.sceneEntity.entity_id,
      option: value,
    });
  }

  protected render(): TemplateResult {
    if (!this.sceneEntity) return html``;

    const options = this.sceneEntity.attributes?.options ?? [];
    const current = this.sceneEntity.state ?? "";

    // Disable if light is off/unavailable
    const lightState = this.lightEntity?.state ?? "on";
    const disabled = !isAvailable(this.sceneEntity) || lightState === "off";

    return html`
      <select
        .value=${current}
        .disabled=${disabled}
        @change=${(e: Event) =>
          this.onChange({
            detail: { value: (e.target as HTMLSelectElement).value },
          } as any)}
      >
        ${options.map(
          (option: string) =>
            html`<option value=${option} ?selected=${option === current}>${option}</option>`
        )}
      </select>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      select {
        width: 100%;
        padding: 0.35em 0.5em;
        border-radius: 0.25em;
        border: 1px solid rgba(0, 0, 0, 0.2);
        background-color: var(--card-background-color, #fff);
        color: var(--primary-text-color, #000);
        font-size: 0.95em;
      }

      select:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `;
  }
}
