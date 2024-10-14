"use client"; 

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Circle, Database, Link2, Save } from 'lucide-react'

// Sample database
const sampleData = {
  Students: [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
  ],
  Courses: [
    { id: 1, title: 'Mathematics', credits: 3 },
    { id: 2, title: 'History', credits: 4 },
  ],
  Enrollments: [
    { id: 1, student_id: 1, course_id: 1, grade: 'A' },
    { id: 2, student_id: 2, course_id: 2, grade: 'B' },
  ],
  Professors: [
    { id: 1, name: 'Dr. Smith', department: 'Math' },
    { id: 2, name: 'Dr. Jones', department: 'History' },
  ],
}

const tables = Object.keys(sampleData).map(tableName => ({
  name: tableName,
  fields: Object.keys(sampleData[tableName][0])
}))

export default function Component() {
  const [sqlQuery, setSqlQuery] = useState('')
  const [visualizations, setVisualizations] = useState<string[]>([])
  const [activeVisualization, setActiveVisualization] = useState('')
  const [queryResult, setQueryResult] = useState<any[]>([])
  const [involvedTables, setInvolvedTables] = useState<string[]>([])
  const [relationships, setRelationships] = useState<[string, string][]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    drawVisualization()
  }, [involvedTables, relationships])

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('SQL Query submitted:', sqlQuery)
    
    // Simple parsing for demonstration
    const involvedTables = tables
      .filter(table => sqlQuery.toLowerCase().includes(table.name.toLowerCase()))
      .map(table => table.name)
    setInvolvedTables(involvedTables)

    // Simple JOIN detection
    const joinRelationships = sqlQuery.toLowerCase().includes('join') 
      ? involvedTables.slice(0, -1).map((table, index) => [table, involvedTables[index + 1]] as [string, string])
      : []
    setRelationships(joinRelationships)

    // Simple query execution (for demonstration purposes)
    let result: any[] = []
    if (sqlQuery.toLowerCase().includes('select')) {
      const tableName = involvedTables[0]
      result = sampleData[tableName]
      
      if (sqlQuery.toLowerCase().includes('where')) {
        const whereClause = sqlQuery.toLowerCase().split('where')[1].trim()
        const [field, value] = whereClause.split('=').map(s => s.trim())
        result = result.filter(row => row[field].toString() === value.replace(/'/g, ''))
      }
      
      if (sqlQuery.toLowerCase().includes('join')) {
        const secondTable = involvedTables[1]
        result = result.flatMap(row => 
          sampleData[secondTable]
            .filter(secondRow => secondRow[`${tableName.toLowerCase().slice(0, -1)}_id`] === row.id)
            .map(secondRow => ({...row, ...secondRow}))
        )
      }
    }
    setQueryResult(result)
  }

  const drawVisualization = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = 100

    involvedTables.forEach((table, index) => {
      const angle = (index / involvedTables.length) * Math.PI * 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      ctx.beginPath()
      ctx.arc(x, y, 30, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(59, 130, 246, 0.5)'
      ctx.fill()
      ctx.fillStyle = 'white'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(table, x, y)
    })

    relationships.forEach(([table1, table2]) => {
      const index1 = involvedTables.indexOf(table1)
      const index2 = involvedTables.indexOf(table2)
      const angle1 = (index1 / involvedTables.length) * Math.PI * 2
      const angle2 = (index2 / involvedTables.length) * Math.PI * 2
      const x1 = centerX + Math.cos(angle1) * radius
      const y1 = centerY + Math.sin(angle1) * radius
      const x2 = centerX + Math.cos(angle2) * radius
      const y2 = centerY + Math.sin(angle2) * radius

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.7)'
      ctx.stroke()
    })
  }

  const saveVisualization = () => {
    if (activeVisualization) {
      setVisualizations(prev => [...prev, activeVisualization])
      setActiveVisualization('')
    }
  }

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Advanced SQL Data Visualization Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleQuerySubmit} className="mb-4">
            <div className="flex space-x-2">
              <Input 
                placeholder="Enter SQL query" 
                value={sqlQuery} 
                onChange={(e) => setSqlQuery(e.target.value)}
                className="flex-grow"
              />
              <Button type="submit">Execute</Button>
            </div>
          </form>
          <canvas 
            ref={canvasRef} 
            width="600" 
            height="400" 
            className="w-full border border-gray-300 rounded-md"
          ></canvas>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Query Result</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {queryResult[0] && Object.keys(queryResult[0]).map(key => (
                    <TableHead key={key}>{key}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {queryResult.map((row, index) => (
                  <TableRow key={index}>
                    {Object.values(row).map((value, i) => (
                      <TableCell key={i}>{value as string}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved Visualizations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {visualizations.map((vis, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{vis}</span>
                  <Button variant="outline" onClick={() => setActiveVisualization(vis)}>Load</Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Save Current Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input 
              placeholder="Visualization Name" 
              value={activeVisualization}
              onChange={(e) => setActiveVisualization(e.target.value)}
            />
            <Button onClick={saveVisualization}>
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}