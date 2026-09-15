import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';

const API_URL = 'http://127.0.0.1:8000';

export default function Dashboard() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');

  const [tasks, setTasks] = useState<any[]>([]);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [userQuery, setUserQuery] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [studyAdvice, setStudyAdvice] = useState('');
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const completedTasks = tasks.filter(
  (task) => task.completed === 1
).length;

const pendingTasks = tasks.filter(
  (task) => task.completed !== 1
).length;

const progressPercentage =
  tasks.length === 0
    ? 0
    : Math.round((completedTasks / tasks.length) * 100);
  
const filteredTasks = tasks.filter((task) => {
  const matchesFilter =
    filter === 'all' ||
    (filter === 'completed' && task.completed === 1) ||
    (filter === 'pending' && task.completed !== 1);

  const matchesSearch =
    task.title.toLowerCase().includes(search.toLowerCase()) ||
    task.description.toLowerCase().includes(search.toLowerCase()) ||
    task.subject.toLowerCase().includes(search.toLowerCase());

  return matchesFilter && matchesSearch;
});

  // Get tasks from backend
  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`);

      const data = await response.json();

      setTasks(data.tasks);
    } catch (error) {
      console.log('Error fetching tasks:', error);
    }
  };

  const getRecommendations = async () => {
  if (userQuery.trim() === '') {
    alert('Please enter what you want to study');
    return;
  }

  try {
    setLoadingRecommendations(true);

    const response = await fetch(
      `${API_URL}/recommend?user_query=${encodeURIComponent(userQuery)}`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    setRecommendations(data.recommendations || []);
    setStudyAdvice(
      data.study_advice || 'No study advice available yet.'
    );

  } catch (error) {
    console.log('Error getting recommendations:', error);
    alert('Failed to get recommendations');
  } finally {
    setLoadingRecommendations(false);
  }
};

  // Load tasks when page opens
  useEffect(() => {
    fetchTasks();
  }, []);

  const deleteTask = async (taskId: number) => {
  try {
    const response = await fetch(
      `${API_URL}/tasks/${taskId}`,
      {
        method: 'DELETE',
      }
    );

    if (response.ok) {
      fetchTasks();
    }
  } catch (error) {
    console.log('Error deleting task:', error);
  }
};

const completeTask = async (taskId: number) => {
  try {
    const response = await fetch(
      `${API_URL}/tasks/${taskId}/complete`,
      {
        method: 'PUT',
      }
    );

    if (response.ok) {
      fetchTasks();
    }
  } catch (error) {
    console.log('Error completing task:', error);
  }
};

const uncompleteTask = async (taskId: number) => {
  try {
    const response = await fetch(
      `${API_URL}/tasks/${taskId}/uncomplete`,
      {
        method: 'PUT',
      }
    );

    if (response.ok) {
      fetchTasks();
    }
  } catch (error) {
    console.log('Error uncompleting task:', error);
  }
};

  // Add task
 const addTask = async () => {
  if (
    title.trim() === '' ||
    description.trim() === '' ||
    subject.trim() === ''
  ) {
    alert('Please fill all fields');
    return;
  }

  try {
    if (editingTask) {
      // Update existing task
      await fetch(`${API_URL}/tasks/${editingTask.id}`, {
        method: 'PUT',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          title: title,
          description: description,
          subject: subject,
          priority: priority,
          due_date: dueDate,
        }),
      });

      setEditingTask(null);
    } else {
      // Add new task
      await fetch(`${API_URL}/tasks`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          title: title,
          description: description,
          subject: subject,
          priority: priority,
          due_date: dueDate,
        }),
      });
    }

    // Clear input fields
    setTitle('');
    setDescription('');
    setSubject('');

    // Refresh tasks
    fetchTasks();

  } catch (error) {
    console.log('Error saving task:', error);
  }
};
     

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

      <Text style={styles.title}>Study Dashboard</Text>
      <View style={styles.summaryContainer}>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📚</Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
            <Text style={styles.statValue}>{tasks.length}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statLabel}>Completed</Text>
            <Text style={styles.statValue}>{completedTasks}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⏳</Text>
            <Text style={styles.statLabel}>Pending</Text>
            <Text style={styles.statValue}>{pendingTasks}</Text>
          </View>
        </View>

        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>
            Study Progress
          </Text>

          <Text style={styles.progressPercentage}>
            {progressPercentage}%
          </Text>
        </View>

          <Text style={styles.progressDetails}>
            {completedTasks} of {tasks.length} tasks completed
          </Text>

        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressPercentage}%` },
            ]}
          />
        </View>

      </View>

      <View style={styles.aiCard}>
  <Text style={styles.aiTitle}>
    ✨ AI Study Assistant
  </Text>

  <Text style={styles.aiDescription}>
    What do you want to study?
  </Text>

  <TextInput
    style={styles.aiinput}
    placeholder="Example: I want to study Python"
    placeholderTextColor="#9CA3AF"
    value={userQuery}
    onChangeText={setUserQuery}
    onSubmitEditing={getRecommendations}
  />

  <TouchableOpacity
  style={styles.aiButton}
  onPress={getRecommendations}
  disabled={loadingRecommendations}
  accessibilityLabel="Get AI study recommendations"
  accessibilityRole="button"
  >
    {loadingRecommendations ? (
  <ActivityIndicator size="small" color="#FFD600" />
) : (
  <Text style={styles.aibuttonText}>
    Get AI Recommendations
  </Text>
)}
  </TouchableOpacity>

  {recommendations.length > 0 && (
    <View style={styles.recommendationContainer}>

      {studyAdvice && (
  <View style={styles.studyAdviceContainer}>
    <Text style={styles.studyAdviceTitle}>
      🤖 AI Study Advice
    </Text>

    <Text style={styles.studyAdviceText}>
  {studyAdvice
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*/g, '')}
  </Text>
  </View>
)}
      <Text style={styles.recommendationTitle}>
        Recommended Tasks
      </Text>

      {recommendations.slice(0, 3).map((item, index) => (
        <View key={index} style={styles.recommendationItem}>
          <Text style={styles.recommendationTaskTitle}>
            {item.task.title}
          </Text>

          <Text style={styles.recommendationScore}>
            Similarity: {(item.score * 100).toFixed(1)}%
          </Text>
          <View style={styles.matchBarBackground}>
  <View
    
    style={[
      styles.matchBarFill,
      { width: `${item.score * 100}%` },
    ]}
  />
</View>
          <Text style={styles.recommendationDetails}>
  🔴 Priority: {item.task.priority}
</Text>

{item.task.due_date && (
  <Text style={styles.recommendationDetails}>
    📅 Due: {item.task.due_date}
  </Text>
)}

<Text style={styles.recommendationDetails}>
  {item.task.completed === 1 ? '✅ Completed' : '⏳ Pending'}
</Text>

<Text style={styles.recommendationReason}>
  💡 {item.reason}
</Text>

        </View>
      ))}
    </View>
  )}
</View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search tasks..."
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filterContainer}>

        <TouchableOpacity
          style={[
          styles.filterButton,
          filter === 'all' && styles.activeFilter
        ]}
          onPress={() => setFilter('all')}
        >
        <Text
          style={[
          styles.filterText,
          filter === 'all' && styles.activeFilterText
        ]}
        >
          All
        </Text>
      </TouchableOpacity>


      <TouchableOpacity
        style={[
        styles.filterButton,
        filter === 'pending' && styles.activeFilter
      ]}
        onPress={() => setFilter('pending')}
      >
      <Text
        style={[
        styles.filterText,
        filter === 'pending' && styles.activeFilterText
      ]}
      >
        Pending
      </Text>
    </TouchableOpacity>


    <TouchableOpacity
        style={[
        styles.filterButton,
        filter === 'completed' && styles.activeFilter
      ]}
        onPress={() => setFilter('completed')}
      >
      <Text
        style={[
        styles.filterText,
        filter === 'completed' && styles.activeFilterText
      ]}
      >
        Completed
      </Text>
    </TouchableOpacity>

</View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Study Plan</Text>

        {filteredTasks.map((task) => (
      <View key={task.id} style={styles.taskContainer}>

    <Text style={styles.taskTitle}>
      {task.title}
    </Text>

    <Text style={styles.taskDescription}>
      {task.description}
    </Text>

    <Text style={styles.subject}>
      {task.subject}
    </Text>

    <View
  style={[
    styles.priorityBadge,
    task.priority === 'High'
      ? styles.highPriority
      : task.priority === 'Medium'
      ? styles.mediumPriority
      : styles.lowPriority,
  ]}
>
  <Text style={styles.priorityBadgeText}>
    Priority: {task.priority}
  </Text>

  {task.due_date && (
    <Text style={styles.dueDateText}>
        📅 Due Date: {task.due_date}
    </Text>
)}

</View>

    {task.completed === 1 && (
      <Text style={styles.completedText}>
        ✓ Completed
      </Text>
)}

    
  <View style={styles.buttonRow}>
    <TouchableOpacity
  style={styles.editButton}
  activeOpacity={0.7}
  onPress={() => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setSubject(task.subject);
    setPriority(task.priority);
    setDueDate(task.due_date || '');
  }}
>
  <Text style={styles.editButtonText}>
    Edit
  </Text>
</TouchableOpacity>

{!task.completed && (
  <TouchableOpacity
    style={styles.completeButton}
    activeOpacity={0.7}
    onPress={() => completeTask(task.id)}
  >
    <Text style={styles.completeButtonText}>
      Mark Complete
    </Text>
  </TouchableOpacity>
)}

{task.completed === 1 && (
  <TouchableOpacity
    style={styles.pendingButton}
    activeOpacity={0.7}
    onPress={() => uncompleteTask(task.id)}
  >
    <Text style={styles.pendingButtonText}>
      Mark Pending
    </Text>
  </TouchableOpacity>
)}

    <TouchableOpacity
      style={styles.deleteButton}
      activeOpacity={0.7}
      onPress={() => deleteTask(task.id)}
    >
      <Text style={styles.deleteButtonText}>
        Delete
      </Text>
    </TouchableOpacity>
  

  </View>

  </View>      
))}
  </View>
      <TextInput
        style={styles.input}
        placeholder="Task title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Task description"
        value={description}
        onChangeText={setDescription}
      />

      <TextInput
        style={styles.input}
        placeholder="Subject"
        value={subject}
        onChangeText={setSubject}
      />

      <TextInput
        style={styles.input}
        placeholder="Due Date (YYYY-MM-DD)"
        value={dueDate}
        onChangeText={setDueDate}
      />

      <TextInput
        style={styles.input}
        placeholder="Priority (High / Medium / Low)"
        value={priority}
        onChangeText={setPriority}
      />

      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
        Priority
      </Text>

      <View style={{ flexDirection: 'row', marginBottom: 15 }}>
        <TouchableOpacity
          style={{
            backgroundColor: priority === 'Low' ? '#16a34a' : '#e5e7eb',
            padding: 10,
            marginRight: 8,
            borderRadius: 8,
          }}
          onPress={() => setPriority('Low')}
        >
          <Text>Low</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: priority === 'Medium' ? '#f59e0b' : '#e5e7eb',
            padding: 10,
            marginRight: 8,
            borderRadius: 8,
          }}
          onPress={() => setPriority('Medium')}
        >
          <Text>Medium</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: priority === 'High' ? '#dc2626' : '#e5e7eb',
            padding: 10,
            borderRadius: 8,
          }}
          onPress={() => setPriority('High')}
        >
          <Text>High</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={addTask}
      >
        <Text style={styles.buttonText}>
            {editingTask ? 'Update Task' : 'Add Study Task'}
        </Text>
      </TouchableOpacity>
      {editingTask && (
  <TouchableOpacity
    style={styles.cancelButton}
    onPress={() => {
      setEditingTask(null);
      setTitle('');
      setDescription('');
      setSubject('');
    }}
  >
    <Text style={styles.cancelButtonText}>
      Cancel Edit
    </Text>
  </TouchableOpacity>
)}
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 32,
    backgroundColor: '#FFD600',
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
  },

  summaryContainer: {
  backgroundColor: 'white',
  padding: 15,
  borderRadius: 12,
  marginBottom: 20,
},

statsContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 20,
},

statCard: {
  flex: 1,
  backgroundColor: '#FFFFFF',
  borderRadius: 14,
  padding: 16,
  marginHorizontal: 4,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#FFD84D',
},

statIcon: {
  fontSize: 24,
  marginBottom: 6,
},

statLabel: {
  fontSize: 14,
  color: '#6b7280',
  marginBottom: 4,
},

statValue: {
  fontSize: 24,
  fontWeight: 'bold',
},

summaryText: {
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 5,
},

progressHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 4,
},

progressTitle: {
  fontSize: 18,
  fontWeight: 'bold',
},

progressPercentage: {
  fontSize: 18,
  fontWeight: 'bold',
},

progressDetails: {
  fontSize: 14,
  marginBottom: 10,
},

progressBarBackground: {
  height: 20,
  backgroundColor: '#e5e7eb',
  borderRadius: 10,
  overflow: 'hidden',
  marginTop: 5,
},

progressBarFill: {
  height: '100%',
  backgroundColor: '#16a34a',
  borderRadius: 10,
},

  card: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    marginBottom: 20,
  },

  filterContainer: {
  flexDirection: 'row',
  marginVertical: 15,
},

filterButton: {
  paddingVertical: 10,
  paddingHorizontal: 18,
  borderRadius: 8,
  backgroundColor: '#e5e7eb',
  marginRight: 10,
},

activeFilter: {
  backgroundColor: '#2563eb',
},

filterText: {
  fontSize: 15,
  fontWeight: '600',
},

activeFilterText: {
  color: 'white',
},

  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  taskContainer: {
  backgroundColor: '#FFFFFF',
  borderRadius: 14,
  padding: 12,
  marginBottom: 10,
  maxWidth: 950,
  borderWidth: 1,
  borderColor: '#ff6691',
  borderLeftWidth: 5,
  borderLeftColor: '#25c0eb',
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },

  shadowOpacity: 0.08,
  shadowRadius: 5,
  elevation: 3,
  },

  taskTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },

  taskDescription: {
  fontSize: 15,
  marginTop: 6,
  color: '#4B5563',
  lineHeight: 22,
  },

  subject: {
  fontSize: 14,
  marginTop: 6,
  color: '#2563eb',
  fontWeight: '600',
  },

  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
  },

  button: {
    backgroundColor: '#2563eb',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
  color: 'white',
  fontSize: 15,
  fontWeight: '600',
},

  deleteButton: {
  backgroundColor: '#EF4444',
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 8,
  alignSelf: 'flex-start',
  marginBottom: 8,

  shadowColor: '#000',
shadowOffset: {
  width: 0,
  height: 2,
},
shadowOpacity: 0.12,
shadowRadius: 3,
elevation: 2,
},

deleteButtonText: {
  color: 'white',
  fontWeight: 'bold',
},

buttonRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  flexWrap: 'wrap',
  marginTop: 10,
  marginBottom: 4,
},

editButton: {
  backgroundColor: '#2563EB',
  paddingVertical: 8,
  paddingHorizontal: 18,
  borderRadius: 8,
  alignSelf: 'flex-start',
  marginBottom: 8,

  shadowColor: '#000',
shadowOffset: {
  width: 0,
  height: 2,
},
shadowOpacity: 0.12,
shadowRadius: 3,
elevation: 2,
},

editButtonText: {
  color: 'white',
  fontWeight: 'bold',
},

completeButton: {
  backgroundColor: '#16A34A',
  paddingVertical: 8,
  paddingHorizontal: 18,
  borderRadius: 8,
  alignSelf: 'flex-start',
  marginBottom: 8,

  shadowColor: '#000',
shadowOffset: {
  width: 0,
  height: 2,
},
shadowOpacity: 0.12,
shadowRadius: 3,
elevation: 2,
},

completeButtonText: {
  color: 'white',
  fontWeight: 'bold',
},

pendingButton: {
  backgroundColor: '#F59E0B',
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 8,
  alignSelf: 'flex-start',
  marginBottom: 8,

  shadowColor: '#000',
shadowOffset: {
  width: 0,
  height: 2,
},
shadowOpacity: 0.12,
shadowRadius: 3,
elevation: 2,
},

pendingButtonText: {
  color: 'white',
  fontWeight: 'bold',
},

cancelButton: {
  backgroundColor: '#6b7280',
  padding: 18,
  borderRadius: 12,
  alignItems: 'center',
  marginTop: 10,
},

cancelButtonText: {
  color: 'white',
  fontSize: 18,
  fontWeight: 'bold',
},

completedText: {
  fontSize: 14,
  color: '#16A34A',
  fontWeight: '600',
  marginTop: 6,
},

dueDateText: {
  fontSize: 14,
  marginTop: 8,
  color: '#6B7280',
  fontWeight: '500',
},

searchInput: {
  backgroundColor: 'white',
  padding: 12,
  borderRadius: 8,
  fontSize: 16,
  marginVertical: 15,
},

priorityBadge: {
  alignSelf: 'flex-start',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
  marginVertical: 8,
},

highPriority: {
  backgroundColor: '#fee2e2',
},

mediumPriority: {
  backgroundColor: '#fef3c7',
},

lowPriority: {
  backgroundColor: '#dcfce7',
},

priorityBadgeText: {
  fontWeight: 'bold',
},

  aiCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  aiTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  aiDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 14,
  },

  aiinput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    marginBottom: 14,
  },

  aiButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
  },

  aibuttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  studyAdviceContainer: {
  backgroundColor: '#FFF7CC',
  padding: 16,
  borderRadius: 14,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: '#F4C430',
},

studyAdviceTitle: {
  fontSize: 17,
  fontWeight: 'bold',
  marginBottom: 8,
},

studyAdviceText: {
  fontSize: 14,
  lineHeight: 21,
  color: '#374151',
},

  recommendationContainer: {
    marginTop: 22,
    paddingTop: 4,
  },

  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  recommendationItem: {
    backgroundColor: '#f3f4f6',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },

  recommendationTaskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  recommendationScore: {
    fontSize: 14,
    marginTop: 5,
    color: '#555555',
  },

  matchBarBackground: {
  height: 6,
  backgroundColor: '#E5E7EB',
  borderRadius: 3,
  marginTop: 8,
  marginBottom: 4,
  overflow: 'hidden',
},

matchBarFill: {
  height: 6,
  backgroundColor: '#2563EB',
  borderRadius: 3,
},

  recommendationDetails: {
  fontSize: 14,
  marginTop: 4,
  color: '#4B5563',
},

recommendationReason: {
  fontSize: 13,
  marginTop: 8,
  color: '#6B7280',
  fontStyle: 'italic',
},

});