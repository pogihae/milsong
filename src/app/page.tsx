import EnlistmentForm from '@/components/EnlistmentForm';

export default function Home() {
  return (
    <main className="mx-auto max-w-lg space-y-8 p-8">
      <h1 className="text-3xl font-bold">입대곡 추천 시스템</h1>
      <p className="text-gray-600">
        입대일을 입력하면 당신의 이병 시절을 대표하는 입대곡을 추천해 드립니다.
        군 생활의 BGM을 찾아보세요.
      </p>
      <EnlistmentForm />
    </main>
  );
}
