
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code2, Database, FileCode2, Globe2, Laptop2, Layers, Lock, Server, Smartphone } from "lucide-react"

const categories = [
  {
    name: "Web Development",
    description: "Frontend, Backend, and Full-stack web development",
    icon: Globe2,
    questionsCount: 1234,
    color: "text-blue-500"
  },
  {
    name: "Mobile Development",
    description: "iOS, Android, and Cross-platform development",
    icon: Smartphone,
    questionsCount: 890,
    color: "text-green-500"
  },
  {
    name: "Database",
    description: "SQL, NoSQL, and database design",
    icon: Database,
    questionsCount: 567,
    color: "text-orange-500"
  },
  {
    name: "DevOps",
    description: "CI/CD, Docker, and Cloud services",
    icon: Server,
    questionsCount: 432,
    color: "text-purple-500"
  },
  {
    name: "Programming",
    description: "Algorithms, Data Structures, and Problem Solving",
    icon: Code2,
    questionsCount: 2341,
    color: "text-red-500"
  },
  {
    name: "Software Architecture",
    description: "Design Patterns and System Design",
    icon: Layers,
    questionsCount: 345,
    color: "text-yellow-500"
  },
  {
    name: "Security",
    description: "Cybersecurity and Application Security",
    icon: Lock,
    questionsCount: 234,
    color: "text-teal-500"
  },
  {
    name: "Desktop Development",
    description: "Windows, macOS, and Linux applications",
    icon: Laptop2,
    questionsCount: 178,
    color: "text-indigo-500"
  },
  {
    name: "Version Control",
    description: "Git, SVN, and collaboration tools",
    icon: FileCode2,
    questionsCount: 145,
    color: "text-pink-500"
  }
]

export default function CategoriesPage() {
  return (
    <div className="flex ml-[330px] flex-col gap-6 p-6 bg-background min-h-screen">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-text">Categories</h1>
        <p className="text-text/80">Browse questions by category</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, i) => (
          <Card 
            key={i} 
            className="bg-foreground border-dashed border border-accent text-text hover:shadow-lg transition-shadow cursor-pointer"
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <div className={`p-2 rounded-lg bg-background/10 ${category.color}`}>
                <category.icon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-text">{category.name}</CardTitle>
                <CardDescription className="text-text/80">
                  {category.questionsCount} questions
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-text/80">{category.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}