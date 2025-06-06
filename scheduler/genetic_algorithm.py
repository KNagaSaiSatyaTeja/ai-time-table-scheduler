import random
from typing import List
import deap.base
import deap.creator
import deap.tools
from model import ScheduleInput, ScheduleAssignment, TimeSlot
from constraints import ConstraintChecker

deap.creator.create("FitnessMin", deap.base.Fitness, weights=(-1.0,))
deap.creator.create("Individual", list, fitness=deap.creator.FitnessMin)

class GeneticAlgorithm:
    def __init__(self, input_data: ScheduleInput, pop_size: int = 100, generations: int = 50):
        self.input_data = input_data
        self.pop_size = pop_size
        self.generations = generations
        self.constraint_checker = ConstraintChecker(input_data)
        self.toolbox = deap.base.Toolbox()
        self._setup_ga()

    def _create_individual(self) -> List[ScheduleAssignment]:
        schedule = []
        for subject in self.input_data.subjects:
            faculty = random.choice(subject.faculty)
            slot = random.choice(faculty.availability)
            room = random.choice(self.input_data.rooms)
            assignment = ScheduleAssignment(
                subject=subject.name,
                faculty_id=faculty.id,
                faculty_name=faculty.name,
                day=slot.day,
                startTime=slot.startTime,
                endTime=slot.endTime,
                student_group=subject.student_group,
                room_id=room
            )
            schedule.append(assignment)
        return schedule

    def _setup_ga(self):
        self.toolbox.register("individual", deap.tools.initIterate, deap.creator.Individual, self._create_individual)
        self.toolbox.register("population", deap.tools.initRepeat, list, self.toolbox.individual)
        self.toolbox.register("evaluate", self.constraint_checker.calculate_fitness)
        self.toolbox.register("mate", self._crossover)
        self.toolbox.register("mutate", self._mutate, indpb=0.2)
        self.toolbox.register("select", deap.tools.selTournament, tournsize=3)

    def _crossover(self, ind1: List[ScheduleAssignment], ind2: List[ScheduleAssignment]) -> tuple:
        point = random.randint(1, len(ind1) - 1)
        ind1[point:], ind2[point:] = ind2[point:], ind1[point:]
        return ind1, ind2

    def _mutate(self, individual: List[ScheduleAssignment], indpb: float) -> tuple:
        for i in range(len(individual)):
            if random.random() < indpb:
                subject = next(s for s in self.input_data.subjects if s.name == individual[i].subject)
                faculty = random.choice(subject.faculty)
                slot = random.choice(faculty.availability)
                room = random.choice(self.input_data.rooms)
                individual[i] = ScheduleAssignment(
                    subject=subject.name,
                    faculty_id=faculty.id,
                    faculty_name=faculty.name,
                    day=slot.day,
                    startTime=slot.startTime,
                    endTime=slot.endTime,
                    student_group=subject.student_group,
                    room_id=room
                )
        return individual,

    def run(self) -> tuple:
        pop = self.toolbox.population(n=self.pop_size)
        fitnesses = list(map(self.toolbox.evaluate, pop))
        for ind, fit in zip(pop, fitnesses):
            ind.fitness.values = (fit,)
        
        for gen in range(self.generations):
            offspring = self.toolbox.select(pop, len(pop))
            offspring = list(map(self.toolbox.clone, offspring))
            
            for child1, child2 in zip(offspring[::2], offspring[1::2]):
                if random.random() < 0.8:
                    self.toolbox.mate(child1, child2)
                    del child1.fitness.values
                    del child2.fitness.values
            
            for mutant in offspring:
                if random.random() < 0.2:
                    self.toolbox.mutate(mutant)
                    del mutant.fitness.values
            
            invalid_ind = [ind for ind in offspring if not ind.fitness.valid]
            fitnesses = map(self.toolbox.evaluate, invalid_ind)
            for ind, fit in zip(invalid_ind, fitnesses):
                ind.fitness.values = (fit,)
            
            pop[:] = deap.tools.selBest(pop + offspring, k=self.pop_size)
        
        best_ind = deap.tools.selBest(pop, k=1)[0]
        return best_ind, best_ind.fitness.values[0]