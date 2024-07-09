<template>
  <div class="bg-purple-200 h-full px-3 md:px-0">
    <h1 class="text-3xl leading-normal pt-7">Todo List</h1>
    <form @submit.prevent="addTodo" class="space-x-7 inline-block">
      <input
        v-model="newTodoTitle"
        placeholder="New Todo"
        class="pl-3 mb-5 lg:mb-0 h-[3rem] focus:outline-blue-400 mt-12 rounded-xl"
      />
      <select v-model="newTodoCompleted" class="px-5 py-2 rounded-xl">
        <option :value="true">Completed</option>
        <option :value="false">Pending</option>
      </select>
      <button
        type="submit"
        class="bg-pink-100 px-5 mt-3 md:mt-0 py-2 rounded-xl"
      >
        Add Todo
      </button>
    </form>
    <ul class="mt-5 space-y-5">
      <li
        v-for="todo in todos"
        :key="todo.id"
        @click="deleteTodo(todo.id)"
        class="bg-white border-2 flex justify-between items-center p-5 border-gray-300 w-full md:w-[20rem] h-[3rem] mx-auto rounded-xl"
      >
        {{ todo.title }} - {{ todo.completed ? 'Completed' : 'Pending' }}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          width="30"
          height="30"
          viewBox="0 0 30 30"
          @click="deleteTodo(todo.id)"
          class="cursor-pointer"
        >
          <path
            d="M 14.984375 2.4863281 A 1.0001 1.0001 0 0 0 14 3.5 L 14 4 L 8.5 4 A 1.0001 1.0001 0 0 0 7.4863281 5 L 6 5 A 1.0001 1.0001 0 1 0 6 7 L 24 7 A 1.0001 1.0001 0 1 0 24 5 L 22.513672 5 A 1.0001 1.0001 0 0 0 21.5 4 L 16 4 L 16 3.5 A 1.0001 1.0001 0 0 0 14.984375 2.4863281 z M 6 9 L 7.7929688 24.234375 C 7.9109687 25.241375 8.7633438 26 9.7773438 26 L 20.222656 26 C 21.236656 26 22.088031 25.241375 22.207031 24.234375 L 24 9 L 6 9 z"
          ></path>
        </svg>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useQuery, useMutation } from '@vue/apollo-composable';
import { gql } from 'graphql-tag';

// Define GET_TODOS query
const GET_TODOS = gql`
  query GetTodos {
    todos {
      id
      title
      completed
    }
  }
`;

// Define ADD_TODO mutation
const ADD_TODO = gql`
  mutation AddTodo($input: TodoInput!) {
    addTodo(input: $input) {
      title
      completed
    }
  }
`;

const DELETE_TODO = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id) {
      id
    }
  }
`;

export default {
  name: 'TodoList',
  setup() {
    const newTodoTitle = ref('');
    const newTodoCompleted = ref(false);
    const todos = ref([]);

    const { result, loading, refetch } = useQuery(GET_TODOS);

    onMounted(() => {
      todos.value = result?.value?.todos || [];
    });

    const { mutate: addTodoMutation } = useMutation(ADD_TODO, DELETE_TODO, {
      update(cache, { data }) {
        const { addTodo, deleteTodo } = data; // Assuming your mutation returns both added and deleted todo objects

        cache.modify({
          fields: {
            todos(existingTodos = []) {
              // Handle Adding a Todo
              if (addTodo) {
                const newTodoRef = cache.writeFragment({
                  data: addTodo,
                  fragment: gql`
                    fragment NewTodo on Todo {
                      id
                      title
                      completed
                    }
                  `,
                });
                return [...existingTodos, newTodoRef];
              }

              // Handle Deleting a Todo
              if (deleteTodo) {
                const deletedTodoId = deleteTodo.id;
                return existingTodos.filter(
                  (todo) => todo.id !== deletedTodoId
                );
              }

              // If no addTodo or deleteTodo data, return existing todos (no change)
              return existingTodos;
            },
          },
        });
        refetch();
      },
    });

    const addTodo = async () => {
      if (!newTodoTitle.value.trim()) {
        console.error('Todo title cannot be empty');
        return;
      }
      const variables = {
        input: {
          title: newTodoTitle.value.trim(),
          completed: newTodoCompleted.value,
        },
      };
      await addTodoMutation(variables)
        .then(() => {
          newTodoTitle.value = '';
          newTodoCompleted.value = false;
        })
        .catch((error) => {
          console.error('Error adding todo:', error.message);
        });
    };
    // const deleteTodo = async (todoId) => {
    //   try {
    //     await addTodoMutation({ variables: { id: todoId } }); // Use addTodoMutation for deletion
    //     console.log('Todo deleted successfully!');
    //   } catch (error) {
    //     console.error('Error deleting todo:', error.message);
    //   }
    // };

    return {
      todos,
      newTodoTitle,
      newTodoCompleted,
      addTodo,
      loading,
    };
  },
};
</script>
