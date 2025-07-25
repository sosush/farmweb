export const gardeningFacts = [
    "A single large tree can absorb up to 48 pounds of CO2 per year and produce enough oxygen for two people?",
    "Earthworms can process their own body weight in organic matter every single day?",
    "Companion planting can increase crop yields by up to 30% while naturally repelling pests?",
    "Plants can communicate with each other through underground fungal networks called mycorrhizae?",
    "A handful of healthy soil contains more microorganisms than there are people on Earth?",
    "Tomatoes were once considered poisonous in Europe because wealthy people got sick from lead poisoning caused by acidic tomatoes leaching lead from pewter plates?",
    "The smell of freshly cut grass is actually a plant distress signal to warn other plants of danger?",
    "Carrots were originally purple, not orange? Orange carrots were developed in the Netherlands in the 17th century?",
    "Plants grown in lunar soil (brought back by Apollo missions) can actually germinate and grow?",
    "A single sunflower head can contain up to 2,000 seeds arranged in perfect mathematical spirals?",
    "Bananas are berries, but strawberries aren't? Botanically speaking, berries must have seeds inside their flesh?",
    "The world's oldest known living tree is a bristlecone pine named Methuselah, estimated to be over 4,850 years old?",
    "Plants can 'hear' the sound of running water and will grow their roots toward the sound?",
    "A pumpkin is 90% water, making it one of the most water-dense vegetables you can grow?",
    "Bamboo is the fastest-growing plant on Earth, with some species growing up to 3 feet in just 24 hours?",
    "The practice of crop rotation was used by ancient civilizations over 6,000 years ago?",
    "Plants produce natural pesticides? Many herbs and flowers contain compounds that naturally repel harmful insects?",
    "A single bee colony can pollinate 300 million flowers in one day?",
    "Coffee plants are self-pollinating, which is why coffee beans from the same plant taste consistent?",
    "The oldest surviving garden design is from ancient Egypt, dating back to 1400 BCE?",
    "Vanilla comes from orchids? The vanilla bean is actually the seed pod of a specific orchid species?",
    "Plants can live without soil? Hydroponic and aeroponic systems can grow plants using just water and nutrients?",
    "The largest living organism on Earth is a fungus in Oregon that spans 2,400 acres?",
    "Marigolds can help tomatoes taste better when planted nearby due to chemical compounds they release?",
    "A single corn plant can have over 1,000 kernels and produce 1-2 ears per plant?",
    "The scent of roses is strongest in the morning because that's when they produce the most oils?",
    "Lettuce is 96% water, making it one of the most hydrating vegetables you can eat?",
    "Plants can get sunburned just like humans, which is why some need shade cloth in intense heat?",
    "The color of hydrangea flowers depends on the pH of the soil they're growing in?",
    "A single apple tree can produce up to 800 apples in one season?",
    "Mint plants can take over a garden because they spread through underground runners?",
    "The holes in Swiss cheese plant (Monstera) leaves help them withstand strong winds in their native tropical habitat?",
    "Potatoes were the first vegetable grown in space by NASA and the University of Wisconsin in 1995?",
    "The word 'vegetable' has no botanical meaning? Scientifically, we eat fruits, roots, stems, and leaves?",
    "A single pea plant can fix up to 5 grams of nitrogen in the soil per season?",
    "The largest flower in the world (Rafflesia) can grow up to 3 feet across and weighs up to 15 pounds?",
    "Garlic can help protect other plants from pests when planted as a companion crop?",
    "The average strawberry has about 200 seeds on its exterior surface?",
    "Plants can produce their own natural fertilizer through a process called nitrogen fixation?",
    "The spiral pattern in pinecones, sunflowers, and pineapples follows the Fibonacci sequence?",
    "Cucumber plants are 95% water and can help cool the surrounding air through transpiration?",
    "The phrase 'busy as a bee' is accurate - a single bee visits 2,000-5,000 flowers per day?",
    "Plants 'sleep' at night? Many flowers close their petals and leaves fold up when the sun sets?",
    "A single dandelion plant can produce up to 2,000 seeds, each capable of traveling up to 60 miles?",
    "The oldest known vegetable garden dates back to 9,000 BCE in the Jordan Valley?",
    "Peppers measure their heat in Scoville units, named after pharmacist Wilbur Scoville?",
    "A mature oak tree can drop up to 10,000 acorns in a single year?",
    "Plants can reduce indoor air pollution by filtering out harmful chemicals like formaldehyde and benzene?",
    "The largest seed in the world comes from the coco de mer palm and can weigh up to 40 pounds?",
    "Herbs like basil and oregano become more flavorful when they're slightly stressed by less water?",
    "A single rhubarb plant can produce edible stalks for up to 20 years with proper care?"
  ];
  
  export const getRandomGardeningFact = (): string => {
    const randomIndex = Math.floor(Math.random() * gardeningFacts.length);
    return gardeningFacts[randomIndex];
  };