import { useState, useEffect } from "react";
import { fetchToppings } from '@/services/toppingService';
import { ToppingItem } from '@/types/types';

export function useToppings() {
  const [toppingsList, setToppingsList] = useState<ToppingItem[]>([]);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [isToppingsLoading, setIsToppingsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchToppings()
      .then((data) => setToppingsList(data))
      .finally(() => setIsToppingsLoading(false));
  }, []);

  const handleToppingToggle = (name: string) => {
    setSelectedToppings((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  return {
    toppingsList,
    selectedToppings,
    isToppingsLoading,
    handleToppingToggle,
    setSelectedToppings,
  };
}