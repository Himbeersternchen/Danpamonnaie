import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  rectSwappingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Flex } from "../../../../resuable-ui/layout/Flex";

import React from "react";
import { useDanpaStore } from "../../../zustand/store";
import { DataProvider } from "../../providers/DataProvider";
import { AddChartButton } from "../components/AddChartButton";
import { DraggableCell } from "../dnd/DraggableCell";
import { DraggableGrid } from "../dnd/DraggableGrid";

export function Dashboard() {
  const items = useDanpaStore((state) => state.items);
  const swapItems = useDanpaStore((state) => state.swapItems);
  const addItem = useDanpaStore((state) => state.addItem);
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const activeItem = items.find((item) => item.id === activeId);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      swapItems(active.id, over.id);
    }
    setActiveId(null);
  };

  return (
    <DataProvider>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Flex justify="center" className="min-h-screen">
          <div className="w-full sm:w-fit p-2 sm:p-6 overflow-x-auto">
            <SortableContext items={items} strategy={rectSwappingStrategy}>
              <DraggableGrid
                items={items}
                itemKey={(item) => item.id}
                renderItem={(item) => <DraggableCell item={item} />}
              />
            </SortableContext>

            <DragOverlay
              dropAnimation={() => {}}
              className=" bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-2xl shadow-blue-500/30 scale-105 rotate-2 z-5"
            >
              {activeId && activeItem ? (
                <DraggableCell item={activeItem} />
              ) : null}
            </DragOverlay>
          </div>
        </Flex>
        <AddChartButton onAddChart={addItem} />
      </DndContext>
    </DataProvider>
  );
}
