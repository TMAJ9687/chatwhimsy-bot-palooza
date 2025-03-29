
import React from "react";
import { cn } from "@/lib/utils";

type ColorGroup = {
  name: string;
  colors: {
    value: string;
    name: string;
  }[];
};

interface ColorPaletteProps {
  className?: string;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ className }) => {
  const colorGroups: ColorGroup[] = [
    {
      name: "Primary",
      colors: [
        { value: "bg-primary", name: "primary" },
        { value: "bg-primary-foreground", name: "primary-foreground" },
      ],
    },
    {
      name: "Secondary",
      colors: [
        { value: "bg-secondary", name: "secondary" },
        { value: "bg-secondary-foreground", name: "secondary-foreground" },
      ],
    },
    {
      name: "Accent",
      colors: [
        { value: "bg-accent", name: "accent" },
        { value: "bg-accent-foreground", name: "accent-foreground" },
      ],
    },
    {
      name: "Teal",
      colors: [
        { value: "bg-teal-50", name: "teal-50" },
        { value: "bg-teal-100", name: "teal-100" },
        { value: "bg-teal-200", name: "teal-200" },
        { value: "bg-teal-300", name: "teal-300" },
        { value: "bg-teal-400", name: "teal-400" },
        { value: "bg-teal-500", name: "teal-500" },
        { value: "bg-teal-600", name: "teal-600" },
        { value: "bg-teal-700", name: "teal-700" },
        { value: "bg-teal-800", name: "teal-800" },
        { value: "bg-teal-900", name: "teal-900" },
      ],
    },
    {
      name: "Orange",
      colors: [
        { value: "bg-orange-50", name: "orange-50" },
        { value: "bg-orange-100", name: "orange-100" },
        { value: "bg-orange-200", name: "orange-200" },
        { value: "bg-orange-300", name: "orange-300" },
        { value: "bg-orange-400", name: "orange-400" },
        { value: "bg-orange-500", name: "orange-500" },
        { value: "bg-orange-600", name: "orange-600" },
        { value: "bg-orange-700", name: "orange-700" },
        { value: "bg-orange-800", name: "orange-800" },
        { value: "bg-orange-900", name: "orange-900" },
      ],
    },
    {
      name: "Red",
      colors: [
        { value: "bg-red-50", name: "red-50" },
        { value: "bg-red-100", name: "red-100" },
        { value: "bg-red-200", name: "red-200" },
        { value: "bg-red-300", name: "red-300" },
        { value: "bg-red-400", name: "red-400" },
        { value: "bg-red-500", name: "red-500" },
        { value: "bg-red-600", name: "red-600" },
        { value: "bg-red-700", name: "red-700" },
        { value: "bg-red-800", name: "red-800" },
        { value: "bg-red-900", name: "red-900" },
      ],
    },
    {
      name: "Neutral",
      colors: [
        { value: "bg-background", name: "background" },
        { value: "bg-foreground", name: "foreground" },
        { value: "bg-card", name: "card" },
        { value: "bg-card-foreground", name: "card-foreground" },
        { value: "bg-muted", name: "muted" },
        { value: "bg-muted-foreground", name: "muted-foreground" },
        { value: "bg-border", name: "border" },
      ],
    },
  ];

  return (
    <div className={cn("grid gap-6", className)}>
      <h2 className="text-2xl font-bold">Color Palette</h2>
      <div className="grid gap-8">
        {colorGroups.map((group) => (
          <div key={group.name} className="space-y-3">
            <h3 className="text-lg font-semibold">{group.name}</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
              {group.colors.map((color) => (
                <div
                  key={color.name}
                  className="overflow-hidden rounded-md border"
                >
                  <div
                    className={cn("h-16 w-full", color.value)}
                  />
                  <div className="p-2">
                    <p className="text-xs font-medium">{color.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { ColorPalette };
