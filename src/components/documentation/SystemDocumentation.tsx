import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const USE_CASES = [
  {
    module: 'Inspection Module',
    actors: ['Warehouse Personnel', 'Quality Assurance Officer'],
    cases: ['Capture Tile Image', 'Submit Inspection', 'Review Manual Cases', 'Approve or Reject Inspection'],
  },
  {
    module: 'Inventory Module',
    actors: ['Inventory Manager'],
    cases: ['Monitor Stock', 'View Blocked Inventory', 'Track Aging Inventory', 'Export Inventory Report'],
  },
  {
    module: 'Procurement Module',
    actors: ['Purchasing Officer'],
    cases: ['View Reorder Alerts', 'Generate Purchase Requisition', 'Monitor Procurement Status', 'Review Supplier Performance'],
  },
  {
    module: 'Supplier Module',
    actors: ['Purchasing Officer', 'Quality Assurance Officer'],
    cases: ['View Supplier Defect Rate', 'Monitor Lead Time', 'View Delivery History'],
  },
  {
    module: 'Admin Module',
    actors: ['System Administrator'],
    cases: ['Manage Users', 'Assign Roles', 'Configure System Settings'],
  },
];

export function SystemDocumentation() {
  return (
    <div className="space-y-8">
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle>System Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div>
            <p className="mb-2 font-semibold text-foreground">Hardware</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Android phone with camera for warehouse inspection</li>
              <li>Laptop or desktop for web dashboard</li>
              <li>Camera-enabled inspection device</li>
              <li>Stable warehouse network</li>
            </ul>
          </div>
          <div>
            <p className="mb-2 font-semibold text-foreground">Software</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>React Native + Expo mobile app</li>
              <li>React + Vite + TypeScript web dashboard</li>
              <li>Flask + Python backend</li>
              <li>MySQL database</li>
              <li>YOLOv8 for defect detection</li>
              <li>OpenCV for dimensional validation</li>
              <li>JWT authentication</li>
            </ul>
          </div>
          <div>
            <p className="mb-2 font-semibold text-foreground">Network</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Local warehouse network or internet connection</li>
              <li>API connection between mobile, web, and Flask backend</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {USE_CASES.map((item) => (
          <Card key={item.module} className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="text-base">{item.module}</CardTitle>
              <p className="text-xs text-muted-foreground">Actors: {item.actors.join(', ')}</p>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {item.cases.map((useCase) => (
                  <li key={useCase}>{useCase}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle>Detailed Process Flow</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3 text-sm text-muted-foreground">
          <div>
            <p className="mb-2 font-semibold text-foreground">Inspection Process</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>Tiles arrive at warehouse.</li>
              <li>Warehouse personnel records batch details.</li>
              <li>Staff captures tile image.</li>
              <li>AI detects defect and returns confidence score.</li>
              <li>System applies decision rules.</li>
              <li>Passed tiles become Available for Sale.</li>
              <li>Rejected tiles move to Inventory Block.</li>
              <li>Manual Review items are sent to QA Officer.</li>
            </ol>
          </div>
          <div>
            <p className="mb-2 font-semibold text-foreground">Inventory Process</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>Inventory records update after inspection.</li>
              <li>Available and blocked stocks are recalculated.</li>
              <li>System checks reorder threshold.</li>
              <li>Below reorder point triggers alert.</li>
              <li>Aging inventory is flagged for reinspection.</li>
            </ol>
          </div>
          <div>
            <p className="mb-2 font-semibold text-foreground">Procurement Process</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>Reorder alert appears.</li>
              <li>Purchasing Officer reviews alert.</li>
              <li>Purchase requisition draft is generated.</li>
              <li>Supplier performance is checked.</li>
              <li>Purchase request status is updated.</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle>AI Role Explanation</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 text-sm text-muted-foreground">
          <div>
            <p className="mb-2 font-semibold text-foreground">YOLOv8</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Detects visible tile defects from uploaded tile images.</li>
              <li>Classifies defect types such as hole, line, and edge-chipping.</li>
              <li>Returns confidence score for defect documentation.</li>
            </ul>
          </div>
          <div>
            <p className="mb-2 font-semibold text-foreground">OpenCV</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Supports tile dimension validation.</li>
              <li>Measures tile size using image processing.</li>
              <li>Checks whether dimensions are within tolerance.</li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <p className="mb-2 font-semibold text-foreground">Rule-Based Decision Support</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>PASS → Available for Sale</li>
              <li>REJECT → Inventory Block</li>
              <li>MANUAL REVIEW → QA Officer verification</li>
              <li>Low Stock → Reorder Alert</li>
              <li>Supplier defect rate above 10% → Supplier Warning</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
