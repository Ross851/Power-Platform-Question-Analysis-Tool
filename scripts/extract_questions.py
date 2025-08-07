#!/usr/bin/env python3
import json
import re
import sys
from pathlib import Path

def extract_questions_from_html():
    # Read the HTML file
    html_path = Path(__file__).parent.parent / 'index-old.html'
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Try to find the questions array
    # Pattern 1: Direct questions array
    pattern1 = r'const\s+questions\s*=\s*\[(.*?)\];\s*(?:const|var|let|$)'
    match = re.search(pattern1, content, re.DOTALL)
    
    if match:
        try:
            questions_str = '[' + match.group(1) + ']'
            # Clean up JavaScript to valid JSON
            questions_str = re.sub(r'(\w+):', r'"\1":', questions_str)  # Add quotes to keys
            questions_str = re.sub(r',\s*}', '}', questions_str)  # Remove trailing commas
            questions_str = re.sub(r',\s*]', ']', questions_str)
            questions = json.loads(questions_str)
            return questions
        except:
            pass
    
    # Pattern 2: Look for individual question objects
    questions = []
    
    # More comprehensive pattern
    pattern2 = r'\{[^{}]*?"id"\s*:\s*(\d+)[^{}]*?"type"\s*:\s*"([^"]+)"[^{}]*?\}'
    
    # Find all potential question blocks
    blocks = re.finditer(r'\{[^{}]*"id"\s*:\s*\d+.*?\n\s*\}', content, re.DOTALL)
    
    for block in blocks:
        block_text = block.group()
        
        # Extract fields using regex
        id_match = re.search(r'"id"\s*:\s*(\d+)', block_text)
        type_match = re.search(r'"type"\s*:\s*"([^"]+)"', block_text)
        topic_match = re.search(r'"topic"\s*:\s*"([^"]+)"', block_text)
        question_match = re.search(r'"question"\s*:\s*"([^"]+(?:[^"\\]|\\.)*)"', block_text)
        difficulty_match = re.search(r'"difficultyLevel"\s*:\s*"([^"]+)"', block_text)
        exam_area_match = re.search(r'"examArea"\s*:\s*"([^"]+)"', block_text)
        
        if id_match and type_match:
            question = {
                "id": int(id_match.group(1)),
                "type": type_match.group(1),
                "topic": topic_match.group(1) if topic_match else "Unknown",
                "question": question_match.group(1) if question_match else "",
                "difficultyLevel": difficulty_match.group(1) if difficulty_match else "Medium",
                "examArea": exam_area_match.group(1) if exam_area_match else "Unknown"
            }
            
            # Extract options for multiple choice
            if question["type"] == "multiplechoice":
                options_match = re.search(r'"options"\s*:\s*\[(.*?)\]', block_text, re.DOTALL)
                if options_match:
                    question["options"] = []
                    option_pattern = r'\{[^{}]*?"id"\s*:\s*"([^"]+)"[^{}]*?"text"\s*:\s*"([^"]+)"[^{}]*?\}'
                    for opt in re.finditer(option_pattern, options_match.group(1)):
                        question["options"].append({
                            "id": opt.group(1),
                            "text": opt.group(2)
                        })
            
            # Extract sequence items
            elif question["type"] in ["sequence", "dragdrop"]:
                items_match = re.search(r'"items"\s*:\s*\[(.*?)\]', block_text, re.DOTALL)
                if items_match:
                    question["items"] = []
                    item_pattern = r'"([^"]+)"'
                    for item in re.finditer(item_pattern, items_match.group(1)):
                        question["items"].append(item.group(1))
            
            questions.append(question)
    
    return questions

def categorize_questions(questions):
    """Categorize questions by type and exam area"""
    
    # Official PL-600 exam structure
    exam_structure = {
        "areas": [
            {
                "id": "envisioning",
                "name": "Solution Envisioning and Requirements Analysis",
                "weight": "35-40%",
                "topics": [
                    "Initiate solution planning",
                    "Identify organization information and metrics",
                    "Identify existing solutions and systems",
                    "Capture requirements",
                    "Perform fit/gap analysis"
                ]
            },
            {
                "id": "architecture",
                "name": "Architect a Solution",
                "weight": "40-45%",
                "topics": [
                    "Lead the design process",
                    "Design solution topology",
                    "Design customizations",
                    "Design integrations",
                    "Design migrations",
                    "Design the security model",
                    "Design for deployment and operations"
                ]
            },
            {
                "id": "implementation",
                "name": "Implement the Solution",
                "weight": "15-20%",
                "topics": [
                    "Validate the solution design",
                    "Support go-live",
                    "Optimize solution performance"
                ]
            }
        ]
    }
    
    # Categorize by type
    by_type = {}
    for q in questions:
        q_type = q.get("type", "unknown")
        if q_type not in by_type:
            by_type[q_type] = []
        by_type[q_type].append(q)
    
    # Categorize by exam area
    by_area = {"envisioning": [], "architecture": [], "implementation": []}
    
    for q in questions:
        exam_area = q.get("examArea", "").lower()
        topic = q.get("topic", "").lower()
        question_text = q.get("question", "").lower()
        
        if "envisioning" in exam_area or "requirement" in exam_area or "requirement" in topic:
            by_area["envisioning"].append(q)
        elif "architect" in exam_area or "design" in topic or "integration" in topic:
            by_area["architecture"].append(q)
        elif "implement" in exam_area or "optimize" in topic or "deploy" in topic:
            by_area["implementation"].append(q)
        else:
            # Use question content to infer
            if any(word in question_text for word in ["requirement", "stakeholder", "planning", "analysis"]):
                by_area["envisioning"].append(q)
            elif any(word in question_text for word in ["design", "architecture", "integration", "security"]):
                by_area["architecture"].append(q)
            else:
                by_area["implementation"].append(q)
    
    return {
        "exam_structure": exam_structure,
        "by_type": by_type,
        "by_area": by_area,
        "statistics": {
            "total": len(questions),
            "by_type": {k: len(v) for k, v in by_type.items()},
            "by_area": {k: len(v) for k, v in by_area.items()}
        }
    }

def main():
    print("Extracting questions from HTML...")
    questions = extract_questions_from_html()
    
    print(f"Found {len(questions)} questions")
    
    # Categorize questions
    categorized = categorize_questions(questions)
    
    # Print statistics
    print("\n=== Question Statistics ===")
    print(f"Total Questions: {categorized['statistics']['total']}")
    
    print("\n--- By Type ---")
    for q_type, count in categorized['statistics']['by_type'].items():
        print(f"  {q_type}: {count}")
    
    print("\n--- By Exam Area ---")
    for area_id, questions in categorized['by_area'].items():
        area_info = next((a for a in categorized['exam_structure']['areas'] if a['id'] == area_id), None)
        if area_info:
            print(f"  {area_info['name']} ({area_info['weight']}): {len(questions)} questions")
    
    # Save to JSON
    output = {
        "metadata": {
            "total_questions": len(questions),
            "extracted_at": "2025-08-07T20:00:00.000Z",
            "source": "index-old.html",
            "exam_structure": categorized['exam_structure']
        },
        "statistics": categorized['statistics'],
        "questions": questions,
        "questions_by_type": categorized['by_type'],
        "questions_by_area": categorized['by_area']
    }
    
    output_path = Path(__file__).parent.parent / 'src' / 'data' / 'all-extracted-questions.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\nSaved to: {output_path}")
    return output

if __name__ == "__main__":
    main()