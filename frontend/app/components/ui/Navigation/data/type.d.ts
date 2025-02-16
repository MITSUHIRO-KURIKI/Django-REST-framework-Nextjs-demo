export type SubItem = {
  key:   string;
  label: string;
  href:  string;
  icon?: LucideIcon;
};
export type Item = {
  key:   string;
  label: string;
  href?: string;
  icon?: LucideIcon;
  sub?:  SubItem[];
};
export type LoadItemDataProps = {
  llmChatInitial?: SubItem[] | undefined;
  vrmChatInitial?: SubItem[] | undefined;
};