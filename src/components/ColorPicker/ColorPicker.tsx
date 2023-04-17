import { isTransparent } from "../../utils";

import "./ColorPicker.scss";
import { ExcalidrawElement } from "../../element/types";
import { AppState } from "../../types";

import { TopPicks } from "./TopPicks";
import { Picker } from "./Picker";
import ActiveColor from "./ActiveColor";

import * as Popover from "@radix-ui/react-popover";
import { useAtom } from "jotai";
import {
  activeColorPickerSectionAtom,
  ColorPickerType,
} from "./colorPickerUtils";
import { useDevice, useExcalidrawContainer } from "../App";
import { ColorTuple, RADIX_PALETTE, ColorPaletteCustom } from "../../colors";

const isValidColor = (color: string) => {
  const style = new Option().style;
  style.color = color;
  return !!style.color;
};

export const getColor = (color: string): string | null => {
  if (isTransparent(color)) {
    return color;
  }

  // testing for `#` first fixes a bug on Electron (more specfically, an
  // Obsidian popout window), where a hex color without `#` is (incorrectly)
  // considered valid
  return isValidColor(`#${color}`)
    ? `#${color}`
    : isValidColor(color)
    ? color
    : null;
};

export interface ColorPickerProps {
  type: ColorPickerType;
  color: string | null;
  onChange: (color: string) => void;
  label: string;
  elements: readonly ExcalidrawElement[];
  appState: AppState;
  palette?: ColorPaletteCustom;
  topPicks?: ColorTuple;
  updateData: (formData?: any) => void;
}

export const ColorPicker = ({
  type,
  color,
  onChange,
  label,
  elements,
  palette = RADIX_PALETTE,
  topPicks,
  updateData,
  appState,
}: ColorPickerProps) => {
  const [, setActiveColorPickerSection] = useAtom(activeColorPickerSectionAtom);

  const { container } = useExcalidrawContainer();
  const { isMobile, isLandscape } = useDevice();

  return (
    <div>
      <div role="dialog" aria-modal="true" className="color-picker-container">
        <TopPicks
          activeColor={color}
          onChange={onChange}
          type={type}
          topPicks={topPicks}
        />
        <div
          style={{
            width: 1,
            height: "100%",
            backgroundColor: "var(--default-border-color)",
            margin: "0 auto",
          }}
        />
        <Popover.Root
          open={appState.openPopup ? appState.openPopup === type : false}
          onOpenChange={(open) => {
            updateData({ openPopup: open ? type : null });
          }}
        >
          <ActiveColor color={color} label={label} type={type} />

          <Popover.Portal container={container}>
            <Popover.Content
              className="focus-visible-none"
              data-prevent-outside-click
              onCloseAutoFocus={(e) => {
                // return focus to excalidraw container
                if (container) {
                  container.focus();
                }

                e.preventDefault();
                e.stopPropagation();

                setActiveColorPickerSection(null);
              }}
              side={isMobile && !isLandscape ? "bottom" : "right"}
              align={isMobile && !isLandscape ? "center" : "start"}
              alignOffset={-16}
              sideOffset={20}
              style={{
                zIndex: 9999,
                backgroundColor: "var(--popup-bg-color)",
                maxWidth: "208px",
                maxHeight: window.innerHeight,
                padding: "12px",
                borderRadius: "8px",
                boxSizing: "border-box",
                overflowY: "auto",
                boxShadow:
                  "0px 7px 14px rgba(0, 0, 0, 0.05), 0px 0px 3.12708px rgba(0, 0, 0, 0.0798), 0px 0px 0.931014px rgba(0, 0, 0, 0.1702)",
              }}
            >
              <Picker
                palette={palette}
                color={color || null}
                onChange={(changedColor) => {
                  onChange(changedColor);
                }}
                label={label}
                showInput
                type={type}
                elements={elements}
                updateData={updateData}
              />
              <Popover.Arrow
                width={20}
                height={10}
                style={{
                  fill: "var(--popup-bg-color)",
                  filter: "drop-shadow(rgba(0, 0, 0, 0.05) 0px 3px 2px)",
                }}
              />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </div>
  );
};
