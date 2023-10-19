import { BaseFilter, Item } from "https://deno.land/x/ddc_vim@v4.0.5/types.ts";

type Params = {
  labelWidth: number;
  paddingMode: "left" | "right";
  kindLabels: Record<string, string>;
  kindHlGroups: Record<string, string>;
};

export class Filter extends BaseFilter<Params> {
  override filter(args: {
    filterParams: Params;
    items: Item[];
  }): Promise<Item[]> {
    const {
      labelWidth,
      paddingMode,
      kindLabels: labels,
      kindHlGroups: hlGroups,
    } = args.filterParams;

    for (const item of args.items) {
      const origKind = item.kind ?? "";
      item.kind = format(
        labels[origKind] ?? origKind,
        labelWidth,
        paddingMode,
      );

      const hlGroup = hlGroups[origKind];
      if (!hlGroup) {
        continue;
      }

      const hlName = `lsp-kind-label-${origKind}`;
      if (item.highlights?.some((hl) => hl.name === hlName)) {
        continue;
      }

      item.highlights = [
        ...item.highlights ?? [],
        {
          name: hlName,
          type: "kind",
          hl_group: hlGroup,
          col: 1,
          width: labelWidth,
        },
      ];
    }

    return Promise.resolve(args.items);
  }

  override params(): Params {
    return {
      labelWidth: 1,
      paddingMode: "left",
      kindLabels: {},
      kindHlGroups: {},
    };
  }
}

function format(
  kind: string,
  width: number,
  paddingMode: "left" | "right",
): string {
  if (kind.length < width) {
    const padding = " ".repeat(width - kind.length);
    switch (paddingMode) {
      case "left":
        return kind + padding;
      case "right":
        return padding + kind;
    }
  } else {
    return kind.slice(0, width);
  }
}
