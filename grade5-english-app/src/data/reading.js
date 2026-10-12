// קטעי קריאה עם שאלות
// סוגי שאלות:
//   mc    - שאלה אמריקאית: options + answer
//   yesno - שאלת Yes / No: answer = 'Yes' | 'No'
//   order - סידור אירועים לפי סדר התרחשותם: events (בסדר הנכון)

export const readingPassages = [
  {
    id: 'maya',
    title: 'My Name Is Maya',
    text: `Hi! My name is Maya. I am ten years old. I live in Haifa with my family. I have a mother, a father and a little brother. My brother's name is Ben. He is five years old.
I have a cat. Her name is Luna. She is white and very funny.
I like to read books and to swim. I can swim very well. I can't play the piano, but I want to learn.
My favorite food is pizza. My favorite color is purple.`,
    questions: [
      { type: 'mc', q: 'How old is Maya?', options: ['five', 'eight', 'ten', 'twelve'], answer: 'ten' },
      { type: 'mc', q: 'Where does Maya live?', options: ['In Tel Aviv', 'In Haifa', 'In Eilat', 'In London'], answer: 'In Haifa' },
      { type: 'yesno', q: 'Does Maya have a dog?', answer: 'No' },
      { type: 'yesno', q: 'Can Maya swim?', answer: 'Yes' },
      { type: 'yesno', q: 'Can Maya play the piano?', answer: 'No' },
      { type: 'mc', q: 'What color is Luna?', options: ['black', 'brown', 'white', 'purple'], answer: 'white' },
      { type: 'mc', q: 'Who is Ben?', options: ['Maya\'s father', 'Maya\'s brother', 'Maya\'s cat', 'Maya\'s friend'], answer: 'Maya\'s brother' }
    ]
  },
  {
    id: 'saturday',
    title: 'A Day at the Beach',
    text: `On Saturday, Tom and his family go to the beach. In the morning, they get up early and eat breakfast. Then they get into the car and drive to the beach.
At the beach, it is hot and sunny. Tom swims in the sea with his father. His sister Dana makes a big sandcastle. Their mother reads a book under an umbrella.
At twelve o'clock they eat sandwiches and drink cold water. In the afternoon, they play ball on the sand.
In the evening, they go home. Tom is tired but happy.`,
    questions: [
      { type: 'mc', q: 'When do they go to the beach?', options: ['On Monday', 'On Friday', 'On Saturday', 'On Sunday'], answer: 'On Saturday' },
      { type: 'mc', q: 'How do they get to the beach?', options: ['By bus', 'By car', 'By train', 'By bike'], answer: 'By car' },
      { type: 'mc', q: 'What does Dana do?', options: ['She swims', 'She reads a book', 'She makes a sandcastle', 'She sleeps'], answer: 'She makes a sandcastle' },
      { type: 'yesno', q: 'Is it cold at the beach?', answer: 'No' },
      { type: 'yesno', q: 'Is Tom happy in the evening?', answer: 'Yes' },
      { type: 'order', q: 'Put the events in order:', events: ['They eat breakfast.', 'They drive to the beach.', 'They eat sandwiches.', 'They play ball on the sand.', 'They go home.'] }
    ]
  },
  {
    id: 'zoo',
    title: 'A Trip to the Zoo',
    text: `Today our class goes on a trip to the zoo. We go by bus. Our teacher, Mrs. Cohen, comes with us.
First, we see the lions. They are big and they are sleeping. Then we see the monkeys. The monkeys are very funny. They jump and climb trees. Next, we see the elephants. An elephant has a long nose and big ears.
After that, we eat lunch in the park near the zoo. At the end of the day, we buy ice cream. It is a wonderful day!`,
    questions: [
      { type: 'mc', q: 'Who comes with the class?', options: ['Their parents', 'Their teacher', 'The doctor', 'The bus driver'], answer: 'Their teacher' },
      { type: 'mc', q: 'What are the lions doing?', options: ['Eating', 'Running', 'Sleeping', 'Swimming'], answer: 'Sleeping' },
      { type: 'yesno', q: 'Are the monkeys funny?', answer: 'Yes' },
      { type: 'yesno', q: 'Does the class go to the zoo by train?', answer: 'No' },
      { type: 'mc', q: 'What does an elephant have?', options: ['A short nose', 'A long nose', 'Small ears', 'Wings'], answer: 'A long nose' },
      { type: 'order', q: 'Put the events in order:', events: ['They see the lions.', 'They see the monkeys.', 'They see the elephants.', 'They eat lunch.', 'They buy ice cream.'] }
    ]
  },
  {
    id: 'grandma',
    title: 'Grandma\'s Birthday',
    text: `Today is Grandma Rina's birthday. She is seventy years old. Noa wants to make her a cake.
In the morning, Noa and her mother go to the shop. They buy eggs, milk, sugar and chocolate. Then they go home and make a big chocolate cake in the kitchen.
In the evening, all the family comes to Grandma's house. Noa gives Grandma the cake. Everybody sings "Happy Birthday". Grandma is very happy because she loves chocolate!`,
    questions: [
      { type: 'mc', q: 'How old is Grandma Rina?', options: ['seven', 'seventeen', 'sixty', 'seventy'], answer: 'seventy' },
      { type: 'mc', q: 'What kind of cake do they make?', options: ['An apple cake', 'A cheese cake', 'A chocolate cake', 'A banana cake'], answer: 'A chocolate cake' },
      { type: 'mc', q: 'Where do they make the cake?', options: ['In the kitchen', 'In the shop', 'In the garden', 'At school'], answer: 'In the kitchen' },
      { type: 'yesno', q: 'Do they buy eggs at the shop?', answer: 'Yes' },
      { type: 'mc', q: 'Why is Grandma happy?', options: ['Because it is raining', 'Because she loves chocolate', 'Because she is tired', 'Because she has a dog'], answer: 'Because she loves chocolate' },
      { type: 'order', q: 'Put the events in order:', events: ['Noa and her mother go to the shop.', 'They make a cake.', 'The family comes to Grandma\'s house.', 'Everybody sings "Happy Birthday".'] }
    ]
  },
  {
    id: 'dan-pet',
    title: 'Dan\'s New Pet',
    text: `Dan is nine years old. He wants a pet. He asks his parents, "Can I have a dog, please?" His mother says, "No, our house is too small for a dog."
Dan is sad. Then his father says, "You can have a fish." Dan is not very happy. A fish can't play ball and it can't run.
On Friday, they go to the pet shop. Dan sees a small orange fish. It is beautiful! Dan buys the fish and calls it Goldy. Now Dan loves Goldy. He gives Goldy food every morning.`,
    questions: [
      { type: 'mc', q: 'What pet does Dan want at first?', options: ['A cat', 'A dog', 'A fish', 'A bird'], answer: 'A dog' },
      { type: 'mc', q: 'Why can\'t Dan have a dog?', options: ['Because dogs are big', 'Because the house is too small', 'Because Dan is sick', 'Because it is Friday'], answer: 'Because the house is too small' },
      { type: 'yesno', q: 'Can a fish play ball?', answer: 'No' },
      { type: 'mc', q: 'What color is Goldy?', options: ['red', 'blue', 'orange', 'black'], answer: 'orange' },
      { type: 'yesno', q: 'Does Dan love Goldy now?', answer: 'Yes' },
      { type: 'order', q: 'Put the events in order:', events: ['Dan asks for a dog.', 'Dan\'s father says he can have a fish.', 'They go to the pet shop.', 'Dan calls the fish Goldy.'] }
    ]
  },
  {
    id: 'school-day',
    title: 'My School Day',
    text: `My name is Yoni. I get up at seven o'clock. I wash my face, brush my teeth and eat breakfast. I go to school by bike.
School starts at eight o'clock. My favorite subject is English because my teacher is very nice. I don't like math because it is hard for me.
At ten o'clock we have a break. I play football with my friends in the yard. School ends at one o'clock. In the afternoon I do my homework, and then I watch TV.`,
    questions: [
      { type: 'mc', q: 'When does Yoni get up?', options: ['At six o\'clock', 'At seven o\'clock', 'At eight o\'clock', 'At ten o\'clock'], answer: 'At seven o\'clock' },
      { type: 'mc', q: 'How does Yoni go to school?', options: ['By car', 'By bus', 'By bike', 'On foot'], answer: 'By bike' },
      { type: 'mc', q: 'Why does Yoni like English?', options: ['Because it is easy', 'Because his teacher is nice', 'Because he plays football', 'Because it is short'], answer: 'Because his teacher is nice' },
      { type: 'yesno', q: 'Does Yoni like math?', answer: 'No' },
      { type: 'mc', q: 'What does Yoni do in the break?', options: ['He reads a book', 'He eats pizza', 'He plays football', 'He sleeps'], answer: 'He plays football' },
      { type: 'order', q: 'Put the events in order:', events: ['Yoni brushes his teeth.', 'Yoni goes to school by bike.', 'Yoni plays football in the break.', 'Yoni does his homework.', 'Yoni watches TV.'] }
    ]
  },
  {
    id: 'rain',
    title: 'A Rainy Day',
    text: `It is winter. Today it is cold and it is raining. Lily and her brother Sam can't go to the park.
"What can we do?" asks Sam. "We can build a house from boxes!" says Lily. They take big boxes, scissors and colors. They cut a door and two windows. Then they draw flowers on the house.
Their mother makes hot chocolate for them. In the evening, the rain stops and they see a rainbow in the sky. "It's a beautiful day!" says Lily.`,
    questions: [
      { type: 'yesno', q: 'Is it summer?', answer: 'No' },
      { type: 'mc', q: 'Why can\'t the children go to the park?', options: ['Because it is raining', 'Because they are sick', 'Because it is night', 'Because the park is closed'], answer: 'Because it is raining' },
      { type: 'mc', q: 'What do they build?', options: ['A car', 'A house', 'A boat', 'A plane'], answer: 'A house' },
      { type: 'mc', q: 'What do they draw on the house?', options: ['Stars', 'Cats', 'Flowers', 'Trees'], answer: 'Flowers' },
      { type: 'yesno', q: 'Do they see a rainbow?', answer: 'Yes' },
      { type: 'order', q: 'Put the events in order:', events: ['They take big boxes.', 'They cut a door and two windows.', 'They draw flowers.', 'The rain stops.'] }
    ]
  },
  {
    id: 'sport',
    title: 'Sports Day',
    text: `Today is Sports Day at school. All the children wear white shirts. There are many games: running, jumping and football.
Avi is very fast. He can run faster than all the boys in his class. He wins the running race and gets a gold medal.
Shira can jump very high. She wins the jumping game. Ron can't run fast, but he is a very good goalkeeper. His team wins the football game.
At the end of the day, the principal says, "You are all winners!"`,
    questions: [
      { type: 'mc', q: 'What color are the children\'s shirts?', options: ['blue', 'white', 'red', 'green'], answer: 'white' },
      { type: 'mc', q: 'Who wins the running race?', options: ['Shira', 'Ron', 'Avi', 'The principal'], answer: 'Avi' },
      { type: 'yesno', q: 'Can Ron run fast?', answer: 'No' },
      { type: 'yesno', q: 'Can Shira jump high?', answer: 'Yes' },
      { type: 'mc', q: 'What does Avi get?', options: ['A ball', 'A gold medal', 'A shirt', 'A book'], answer: 'A gold medal' },
      { type: 'mc', q: 'What does the principal say?', options: ['"Go home!"', '"You are all winners!"', '"Run faster!"', '"Be quiet!"'], answer: '"You are all winners!"' }
    ]
  }
];

// קטעי האזנה - נקראים בקול על ידי הדפדפן (Text to Speech)
export const listeningPassages = [
  {
    id: 'l-family',
    title: 'Meet Adam',
    text: `Hello! My name is Adam. I am eleven years old. I have two sisters and one brother. My sisters are Tali and Gal. My brother is a baby. I have a big brown dog. His name is Max. Max can run very fast. I like to play football with my friends after school.`,
    questions: [
      { type: 'mc', q: 'How old is Adam?', options: ['nine', 'ten', 'eleven', 'twelve'], answer: 'eleven' },
      { type: 'mc', q: 'How many sisters does Adam have?', options: ['one', 'two', 'three', 'four'], answer: 'two' },
      { type: 'mc', q: 'What color is Max?', options: ['black', 'white', 'brown', 'yellow'], answer: 'brown' },
      { type: 'yesno', q: 'Can Max run fast?', answer: 'Yes' },
      { type: 'mc', q: 'What does Adam like to play?', options: ['basketball', 'football', 'tennis', 'the piano'], answer: 'football' }
    ]
  },
  {
    id: 'l-shop',
    title: 'At the Shop',
    text: `Mom and Rotem go to the shop on Friday. They need food for the weekend. They buy bread, milk, cheese and eggs. Rotem wants chocolate, but Mom says "No, we have chocolate at home." Then they buy apples and bananas. Rotem carries the bag because Mom has a lot of bags.`,
    questions: [
      { type: 'mc', q: 'When do they go to the shop?', options: ['On Sunday', 'On Monday', 'On Friday', 'On Saturday'], answer: 'On Friday' },
      { type: 'yesno', q: 'Do they buy chocolate?', answer: 'No' },
      { type: 'mc', q: 'Which fruit do they buy?', options: ['Apples and bananas', 'Oranges', 'Only bananas', 'Tomatoes'], answer: 'Apples and bananas' },
      { type: 'mc', q: 'Why does Rotem carry the bag?', options: ['Because she is strong', 'Because Mom has a lot of bags', 'Because she is tired', 'Because it is cold'], answer: 'Because Mom has a lot of bags' }
    ]
  },
  {
    id: 'l-weather',
    title: 'The Weather',
    text: `Today is Monday. It is a cold day and it is raining. The children are in the classroom. They can't go out in the break. The teacher says, "Let's sing a song!" The children sing and dance. Tomorrow it will be sunny, and they can play outside.`,
    questions: [
      { type: 'mc', q: 'What day is it today?', options: ['Sunday', 'Monday', 'Friday', 'Saturday'], answer: 'Monday' },
      { type: 'yesno', q: 'Is it hot today?', answer: 'No' },
      { type: 'yesno', q: 'Can the children go out in the break?', answer: 'No' },
      { type: 'mc', q: 'What do the children do?', options: ['They sleep', 'They sing and dance', 'They swim', 'They go home'], answer: 'They sing and dance' }
    ]
  },
  {
    id: 'l-animals',
    title: 'My Favorite Animal',
    text: `My favorite animal is the giraffe. A giraffe is very tall. It has a long neck and long legs. It is yellow and brown. Giraffes live in Africa. They eat leaves from tall trees. A giraffe can run fast, but it can't swim.`,
    questions: [
      { type: 'mc', q: 'What is the favorite animal?', options: ['The lion', 'The elephant', 'The giraffe', 'The monkey'], answer: 'The giraffe' },
      { type: 'mc', q: 'What does a giraffe eat?', options: ['Meat', 'Fish', 'Leaves', 'Bananas'], answer: 'Leaves' },
      { type: 'yesno', q: 'Can a giraffe swim?', answer: 'No' },
      { type: 'mc', q: 'Where do giraffes live?', options: ['In Africa', 'In the sea', 'In Israel', 'In the snow'], answer: 'In Africa' }
    ]
  },
  {
    id: 'l-party',
    title: 'The Party',
    text: `Next Tuesday is Michal's birthday. She is having a party in the garden. She invites ten friends from her class. Her mother makes a big strawberry cake. At the party, the children play games and dance to music. Michal gets a new book and a pink bag. She is very happy.`,
    questions: [
      { type: 'mc', q: 'When is Michal\'s birthday?', options: ['Next Monday', 'Next Tuesday', 'Next Friday', 'Today'], answer: 'Next Tuesday' },
      { type: 'mc', q: 'Where is the party?', options: ['In the garden', 'At school', 'At the beach', 'In the park'], answer: 'In the garden' },
      { type: 'mc', q: 'How many friends does Michal invite?', options: ['five', 'eight', 'ten', 'twelve'], answer: 'ten' },
      { type: 'mc', q: 'What kind of cake is it?', options: ['Chocolate', 'Strawberry', 'Banana', 'Cheese'], answer: 'Strawberry' },
      { type: 'yesno', q: 'Does Michal get a pink bag?', answer: 'Yes' }
    ]
  },
  {
    id: 'l-morning',
    title: 'Every Morning',
    text: `Every morning I get up at half past six. First, I wash my face. Then I get dressed. After that, I eat breakfast. I eat bread with cheese and I drink orange juice. Then I take my bag and walk to school with my friend Yael.`,
    questions: [
      { type: 'mc', q: 'What does the girl drink?', options: ['Milk', 'Water', 'Orange juice', 'Tea'], answer: 'Orange juice' },
      { type: 'mc', q: 'How does she go to school?', options: ['By bus', 'By car', 'She walks', 'By bike'], answer: 'She walks' },
      { type: 'yesno', q: 'Does she go to school with Yael?', answer: 'Yes' },
      { type: 'order', q: 'Put the events in order:', events: ['She washes her face.', 'She gets dressed.', 'She eats breakfast.', 'She walks to school.'] }
    ]
  }
];
