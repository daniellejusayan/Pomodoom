export interface ToDoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ToDoListProps {
  style?: object;
  onSelectTask?: (item: ToDoItem) => void;
  selectedTaskId?: string | null;
}